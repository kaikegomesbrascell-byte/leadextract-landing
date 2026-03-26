# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller Specification File - Google Maps Lead Extractor
Este arquivo configura a geração do executável standalone do Lead Extractor.

Configurações:
- Inclusão de todas as dependências do Playwright
- Inclusão de todas as dependências do CustomTkinter
- Modo one-file para distribuição simplificada
- Compatível com Windows 10 e 11
"""

import sys
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

block_cipher = None

# Coletar dados e submódulos do Playwright
playwright_datas = collect_data_files('playwright', include_py_files=True)
playwright_hiddenimports = collect_submodules('playwright')

# Coletar dados e submódulos do CustomTkinter
customtkinter_datas = collect_data_files('customtkinter', include_py_files=True)
customtkinter_hiddenimports = collect_submodules('customtkinter')

# Coletar dados e submódulos do pandas e openpyxl
pandas_hiddenimports = collect_submodules('pandas')
openpyxl_hiddenimports = collect_submodules('openpyxl')

# Lista de todos os arquivos Python do projeto
project_scripts = [
    'main.py',
    'automation_engine.py',
    'gui_manager.py',
    'license_validator.py',
    'data_exporter.py',
    'error_logger.py',
    'models.py'
]

# Dados adicionais a serem incluídos
added_files = [
    ('license.key', '.'),  # Arquivo de licença de exemplo
]

# Combinar todos os dados
all_datas = playwright_datas + customtkinter_datas + added_files

# Combinar todos os hidden imports
all_hiddenimports = (
    playwright_hiddenimports +
    customtkinter_hiddenimports +
    pandas_hiddenimports +
    openpyxl_hiddenimports +
    [
        'asyncio',
        'threading',
        'tkinter',
        'tkinter.ttk',
        'tkinter.messagebox',
        'tkinter.filedialog',
        'psutil',
        'json',
        'datetime',
        'urllib.parse',
        're',
        'random',
        'os',
        'sys',
        'typing',
        'dataclasses',
    ]
)

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=all_datas,
    hiddenimports=all_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',  # Excluir bibliotecas não utilizadas para reduzir tamanho
        'numpy.testing',
        'pytest',
        'setuptools',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='LeadExtractor',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,  # Usar UPX para compressão (reduz tamanho do executável)
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Não mostrar console (aplicação GUI)
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Adicionar caminho do ícone aqui se disponível (ex: 'icon.ico')
    version_file=None,
)

# Nota sobre o modo one-file:
# Este arquivo está configurado para gerar um executável único (one-file).
# Todas as dependências são empacotadas em um único arquivo .exe.
# 
# Vantagens:
# - Distribuição simplificada (apenas um arquivo)
# - Mais fácil para o usuário final
# 
# Desvantagens:
# - Tempo de inicialização ligeiramente maior (extração temporária)
# - Tamanho do executável maior
#
# Para mudar para modo one-folder (múltiplos arquivos), modifique o bloco EXE:
# - Remova as linhas: a.binaries, a.zipfiles, a.datas
# - Adicione após o bloco EXE:
#   coll = COLLECT(
#       exe,
#       a.binaries,
#       a.zipfiles,
#       a.datas,
#       strip=False,
#       upx=True,
#       upx_exclude=[],
#       name='LeadExtractor',
#   )
