#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;

use db::DbState;
use models::{Bookmark, Switch};
use tauri::{command, Manager, State};

#[command]
async fn list_tasks(state: State<'_, DbState>) -> Result<Vec<models::Task>, String> {
    state.list_tasks().map_err(|err| err.to_string())
}

#[command]
async fn create_task(state: State<'_, DbState>, title: String) -> Result<(), String> {
    state.create_task(&title).map_err(|err| err.to_string())
}

#[command]
async fn toggle_task(state: State<'_, DbState>, id: i64, completed: bool) -> Result<(), String> {
    state.toggle_task(id, completed).map_err(|err| err.to_string())
}

#[command]
async fn delete_task(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    state.delete_task(id).map_err(|err| err.to_string())
}

#[command]
async fn get_bookmark_sections(state: State<'_, DbState>) -> Result<Vec<models::BookmarkSection>, String> {
    state
        .list_bookmark_sections()
        .map_err(|err| err.to_string())
}

#[command]
async fn create_bookmark(state: State<'_, DbState>, payload: Bookmark) -> Result<i64, String> {
    state
        .create_bookmark(&payload)
        .map_err(|err| err.to_string())
}

#[command]
async fn delete_bookmark(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    state.delete_bookmark(id).map_err(|err| err.to_string())
}

#[command]
async fn list_switches(state: State<'_, DbState>) -> Result<Vec<Switch>, String> {
    state.list_switches().map_err(|err| err.to_string())
}

#[command]
async fn save_switch(state: State<'_, DbState>, payload: Switch) -> Result<i64, String> {
    state.upsert_switch(&payload).map_err(|err| err.to_string())
}

#[command]
async fn delete_switch(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    state.delete_switch(id).map_err(|err| err.to_string())
}

#[command]
async fn export_database(state: State<'_, DbState>) -> Result<(), String> {
    let data = state.export_json().map_err(|err| err.to_string())?;
    let Some(path) = tauri::api::dialog::blocking::FileDialogBuilder::new()
        .set_title("Guardar respaldo JSON")
        .add_filter("JSON", &["json"])
        .save_file()
    else {
        return Ok(());
    };

    let file = std::fs::File::create(&path).map_err(|err| err.to_string())?;
    serde_json::to_writer_pretty(file, &data).map_err(|err| err.to_string())?;
    println!("Respaldo exportado a {:?}", path);
    Ok(())
}

#[command]
async fn import_database(state: State<'_, DbState>) -> Result<(), String> {
    let Some(path) = tauri::api::dialog::blocking::FileDialogBuilder::new()
        .set_title("Selecciona un respaldo JSON")
        .add_filter("JSON", &["json"])
        .pick_file()
    else {
        return Ok(());
    };

    let content = std::fs::read_to_string(path).map_err(|err| err.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&content).map_err(|err| err.to_string())?;
    state.import_json(json).map_err(|err| err.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let state = DbState::new(app)?;
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_tasks,
            create_task,
            toggle_task,
            delete_task,
            get_bookmark_sections,
            create_bookmark,
            delete_bookmark,
            list_switches,
            save_switch,
            delete_switch,
            export_database,
            import_database
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
