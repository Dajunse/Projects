use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: i64,
    pub title: String,
    pub completed: i64,
    pub created_at: String,
}

impl Task {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            id: row.get("id")?,
            title: row.get("title")?,
            completed: row.get("completed")?,
            created_at: row.get("created_at")?,
        })
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Bookmark {
    pub id: i64,
    pub label: String,
    pub url: String,
    pub section: String,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
}

impl Bookmark {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        let tags: Option<String> = row.get("tags")?;
        Ok(Self {
            id: row.get("id")?,
            label: row.get("label")?,
            url: row.get("url")?,
            section: row.get("section")?,
            description: row.get("description")?,
            tags: tags.map(|value| value.split(',').map(|s| s.trim().to_string()).collect()),
        })
    }

    pub fn tags_as_string(&self) -> Option<String> {
        self.tags.as_ref().map(|tags| tags.join(","))
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BookmarkSection {
    pub id: String,
    pub title: String,
    pub links: Vec<Bookmark>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Switch {
    pub id: Option<i64>,
    pub name: String,
    pub ip: String,
    pub location: Option<String>,
    pub notes: Option<String>,
}

impl Switch {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            id: row.get("id")?,
            name: row.get("name")?,
            ip: row.get("ip")?,
            location: row.get("location")?,
            notes: row.get("notes")?,
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CredentialsPayload {
    pub username: String,
    pub password: String,
    pub notes: Option<String>,
}
