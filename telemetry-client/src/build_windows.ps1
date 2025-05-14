pyinstaller `
    --onefile ./.py `
    --windowed `
    --add-data "../config/config_template.yaml;." `
    --additional-hooks-dir=. `
    --name "CatmonitClient" `
    --diskpath ../dist `
    --workpath ../build `
    --clean `
    src/windows/service.py