use base64::Engine;
use arboard::{Clipboard, ImageData};
use std::borrow::Cow;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[tauri::command]
fn set_ignore_cursor_events(window: tauri::Window, ignore: bool) -> Result<(), String> {
    window.set_ignore_cursor_events(ignore).map_err(|e| e.to_string())
}

#[tauri::command]
fn copy_image_to_clipboard(base64_data: String) -> Result<(), String> {
    let clean_b64 = if let Some(stripped) = base64_data.strip_prefix("data:image/png;base64,") {
        stripped
    } else {
        &base64_data
    };

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(clean_b64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let img = image::load_from_memory(&bytes)
        .map_err(|e| format!("Failed to parse image: {}", e))?
        .to_rgba8();

    let (width, height) = img.dimensions();
    let raw_bytes = img.into_raw();

    let image_data = ImageData {
        width: width as usize,
        height: height as usize,
        bytes: Cow::Owned(raw_bytes),
    };

    let mut clipboard = Clipboard::new().map_err(|e| format!("Clipboard error: {}", e))?;
    clipboard.set_image(image_data).map_err(|e| format!("Copy image error: {}", e))?;

    Ok(())
}

fn get_captures_dir() -> PathBuf {
    let mut path = if let Some(user_profile) = std::env::var_os("USERPROFILE") {
        let mut p = PathBuf::from(user_profile);
        p.push("Pictures");
        p
    } else {
        PathBuf::from(".")
    };

    path.push("EpicPenCaptures");
    let _ = fs::create_dir_all(&path);
    path
}

#[tauri::command]
fn save_file(base64_data: String, filename: String) -> Result<String, String> {
    let clean_b64 = if let Some(pos) = base64_data.find(",") {
        &base64_data[pos + 1..]
    } else {
        &base64_data
    };

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(clean_b64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let dir = get_captures_dir();
    let mut file_path = dir.clone();
    file_path.push(&filename);

    fs::write(&file_path, bytes).map_err(|e| format!("Failed to save file: {}", e))?;
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn open_captures_folder() -> Result<(), String> {
    let dir = get_captures_dir();
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if shortcut.matches(Modifiers::CONTROL | Modifiers::ALT, Code::KeyD) {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.emit("global-toggle-draw", ());
                            }
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_decorations(false);
                let _ = window.set_shadow(false);
                let _ = window.set_title("");
            }

            // Registrar atalho global Ctrl+Alt+D no sistema operacional
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyD);
            let _ = app.global_shortcut().register(shortcut);

            let toggle_i = MenuItem::with_id(app, "toggle", "✏️ Mostrar / Ocultar EpicPen", true, None::<&str>)?;
            let open_i = MenuItem::with_id(app, "open_captures", "📁 Pasta de Capturas", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "🚪 Sair", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_i, &open_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle" => {
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(true) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.emit("global-toggle-draw", ());
                            }
                        }
                    }
                    "open_captures" => {
                        let _ = open_captures_folder();
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(true) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.emit("global-toggle-draw", ());
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_ignore_cursor_events,
            copy_image_to_clipboard,
            save_file,
            open_captures_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
