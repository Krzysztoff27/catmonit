# -*- mode: python ; coding: utf-8 -*-
import os
import glob

logic_dir = os.path.abspath('logic')
logic_datas = [(f, 'logic') for f in glob.glob(os.path.join(logic_dir, '*.py'))]

a = Analysis(
    ['service.py'],
    pathex=['.', 'logic'],
    binaries=[],
    datas=[],
    hiddenimports=['win32timezone'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
a.datas += Tree('logic', prefix='logic')

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='CatMonitTelemetryClient',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
