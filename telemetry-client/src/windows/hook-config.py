from PyInstaller.utils.hooks import collect_data_files

datas = collect_data_files('src', includes=['../config/config_template.yaml'])