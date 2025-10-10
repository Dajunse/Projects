use once_cell::sync::Lazy;
use rusqlite::{params, Connection};
use std::fs;
use std::sync::Mutex;
use tauri::AppHandle;

use crate::models::{Bookmark, BookmarkSection, Switch, Task};

pub struct DbState {
    pub connection: Mutex<Connection>,
}

static INIT_SCRIPT: Lazy<&'static str> = Lazy::new(|| include_str!("../migrations/001_init.sql"));

impl DbState {
    pub fn new(app: &AppHandle) -> tauri::Result<Self> {
        let base_dir = app
            .path_resolver()
            .app_data_dir()
            .ok_or_else(|| tauri::Error::FailedToSetup)?;
        if !base_dir.exists() {
            fs::create_dir_all(&base_dir)?;
        }
        let db_path = base_dir.join("portal.db");
        let connection = Connection::open(db_path)?;
        connection.execute_batch(*INIT_SCRIPT)?;
        Ok(Self {
            connection: Mutex::new(connection),
        })
    }

    pub fn list_tasks(&self) -> rusqlite::Result<Vec<Task>> {
        let conn = self.connection.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC")?;
        let rows = stmt.query_map([], |row| Task::from_row(row))?;
        rows.collect()
    }

    pub fn create_task(&self, title: &str) -> rusqlite::Result<()> {
        let conn = self.connection.lock().unwrap();
        conn.execute("INSERT INTO tasks (title) VALUES (?)", params![title])?;
        Ok(())
    }

    pub fn toggle_task(&self, id: i64, completed: bool) -> rusqlite::Result<()> {
        let conn = self.connection.lock().unwrap();
        conn.execute(
            "UPDATE tasks SET completed = ?, created_at = created_at WHERE id = ?",
            params![completed as i64, id],
        )?;
        Ok(())
    }

    pub fn delete_task(&self, id: i64) -> rusqlite::Result<()> {
        let conn = self.connection.lock().unwrap();
        conn.execute("DELETE FROM tasks WHERE id = ?", params![id])?;
        Ok(())
    }

    pub fn list_bookmark_sections(&self) -> rusqlite::Result<Vec<BookmarkSection>> {
        let conn = self.connection.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, label, url, section, description, tags FROM bookmarks ORDER BY section, label")?;
        let mut sections: std::collections::BTreeMap<String, BookmarkSection> = std::collections::BTreeMap::new();

        let rows = stmt.query_map([], |row| Bookmark::from_row(row))?;
        for bookmark in rows {
            let bookmark = bookmark?;
            let entry = sections
                .entry(bookmark.section.clone())
                .or_insert_with(|| BookmarkSection {
                    id: bookmark.section.clone(),
                    title: bookmark.section.clone(),
                    links: Vec::new(),
                });
            entry.links.push(bookmark);
        }

        Ok(sections.into_iter().map(|(_, section)| section).collect())
    }

    pub fn create_bookmark(&self, bookmark: &Bookmark) -> rusqlite::Result<i64> {
        let conn = self.connection.lock().unwrap();
        conn.execute(
            "INSERT INTO bookmarks (label, url, section, description, tags) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![bookmark.label, bookmark.url, bookmark.section, bookmark.description, bookmark.tags_as_string()],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn delete_bookmark(&self, id: i64) -> rusqlite::Result<()> {
        let conn = self.connection.lock().unwrap();
        conn.execute("DELETE FROM bookmarks WHERE id = ?", params![id])?;
        Ok(())
    }

    pub fn list_switches(&self) -> rusqlite::Result<Vec<Switch>> {
        let conn = self.connection.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, name, ip, location, notes FROM switches ORDER BY name")?;
        let rows = stmt.query_map([], |row| Switch::from_row(row))?;
        rows.collect()
    }

    pub fn upsert_switch(&self, switch: &Switch) -> rusqlite::Result<i64> {
        let conn = self.connection.lock().unwrap();
        if let Some(id) = switch.id {
            conn.execute(
                "UPDATE switches SET name = ?1, ip = ?2, location = ?3, notes = ?4 WHERE id = ?5",
                params![switch.name, switch.ip, switch.location, switch.notes, id],
            )?;
            Ok(id)
        } else {
            conn.execute(
                "INSERT INTO switches (name, ip, location, notes) VALUES (?1, ?2, ?3, ?4)",
                params![switch.name, switch.ip, switch.location, switch.notes],
            )?;
            Ok(conn.last_insert_rowid())
        }
    }

    pub fn delete_switch(&self, id: i64) -> rusqlite::Result<()> {
        let conn = self.connection.lock().unwrap();
        conn.execute("DELETE FROM switches WHERE id = ?", params![id])?;
        Ok(())
    }

    pub fn export_json(&self) -> rusqlite::Result<serde_json::Value> {
        let conn = self.connection.lock().unwrap();
        let mut payload = serde_json::Map::new();

        let mut tables = [
            ("users", "SELECT id, username, password_hash, role, created_at FROM users"),
            ("switches", "SELECT id, name, ip, location, notes, credentials, created_at FROM switches"),
            ("ports", "SELECT id, switch_id, name, vlan_id, status, description, updated_at FROM ports"),
            ("vlans", "SELECT id, switch_id, vlan_number, name, purpose FROM vlans"),
            ("manuals", "SELECT id, title, path, tags FROM manuals"),
            ("formats", "SELECT id, title, path, tags FROM formats"),
            ("bookmarks", "SELECT id, label, url, section, description, tags FROM bookmarks"),
            ("tasks", "SELECT id, title, completed, created_at FROM tasks"),
        ];

        for (table, query) in tables.iter() {
            let mut stmt = conn.prepare(query)?;
            let rows = stmt.query_map([], |row| {
                let column_count = row.column_count();
                let mut json_row = serde_json::Map::new();
                for index in 0..column_count {
                    let column_name = row.column_name(index)?.to_string();
                    let value: rusqlite::types::Value = row.get(index)?;
                    let json_value = match value {
                        rusqlite::types::Value::Null => serde_json::Value::Null,
                        rusqlite::types::Value::Integer(v) => serde_json::Value::from(v),
                        rusqlite::types::Value::Real(v) => serde_json::Value::from(v),
                        rusqlite::types::Value::Text(v) => serde_json::Value::from(String::from_utf8_lossy(&v).to_string()),
                        rusqlite::types::Value::Blob(v) => serde_json::Value::from(base64::encode(v)),
                    };
                    json_row.insert(column_name, json_value);
                }
                Ok(serde_json::Value::Object(json_row))
            })?;
            let mut array = Vec::new();
            for row in rows {
                array.push(row?);
            }
            payload.insert(table.to_string(), serde_json::Value::Array(array));
        }

        Ok(serde_json::Value::Object(payload))
    }

    pub fn import_json(&self, data: serde_json::Value) -> rusqlite::Result<()> {
        let conn = self.connection.lock().unwrap();
        let tx = conn.transaction()?;

        if let Some(arr) = data.get("bookmarks").and_then(|value| value.as_array()) {
            tx.execute("DELETE FROM bookmarks", [])?;
            for item in arr {
                let label = item.get("label").and_then(|v| v.as_str()).unwrap_or_default();
                let url = item.get("url").and_then(|v| v.as_str()).unwrap_or_default();
                let section = item.get("section").and_then(|v| v.as_str()).unwrap_or("General");
                let description = item.get("description").and_then(|v| v.as_str());
                let tags = item.get("tags").and_then(|v| v.as_str());
                tx.execute(
                    "INSERT INTO bookmarks (label, url, section, description, tags) VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![label, url, section, description, tags],
                )?;
            }
        }

        if let Some(arr) = data.get("tasks").and_then(|value| value.as_array()) {
            tx.execute("DELETE FROM tasks", [])?;
            for item in arr {
                let title = item.get("title").and_then(|v| v.as_str()).unwrap_or_default();
                let completed = item.get("completed").and_then(|v| v.as_i64()).unwrap_or(0);
                tx.execute(
                    "INSERT INTO tasks (title, completed) VALUES (?1, ?2)",
                    params![title, completed],
                )?;
            }
        }

        if let Some(arr) = data.get("switches").and_then(|value| value.as_array()) {
            tx.execute("DELETE FROM switches", [])?;
            for item in arr {
                let name = item.get("name").and_then(|v| v.as_str()).unwrap_or_default();
                let ip = item.get("ip").and_then(|v| v.as_str()).unwrap_or_default();
                let location = item.get("location").and_then(|v| v.as_str());
                let notes = item.get("notes").and_then(|v| v.as_str());
                tx.execute(
                    "INSERT INTO switches (name, ip, location, notes) VALUES (?1, ?2, ?3, ?4)",
                    params![name, ip, location, notes],
                )?;
            }
        }

        tx.commit()?;
        Ok(())
    }
}
