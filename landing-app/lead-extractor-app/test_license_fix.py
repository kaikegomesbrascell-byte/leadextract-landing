"""
Teste para verificar se a correção do license_validator funciona.
"""

import os
import sys


def test_license_validator():
    """Testa se o LicenseValidator encontra o arquivo license.key corretamente."""
    from license_validator import LicenseValidator
    
    print("=" * 60)
    print("TESTE: Validação de Licença")
    print("=" * 60)
    print()
    
    # Verificar se license.key existe no diretório atual
    if os.path.exists("license.key"):
        print("✅ Arquivo license.key encontrado no diretório atual")
    else:
        print("❌ Arquivo license.key NÃO encontrado no diretório atual")
        print("   Certifique-se de que license.key está na pasta lead-extractor-app/")
        return False
    
    print()
    print("Criando instância de LicenseValidator...")
    validator = LicenseValidator()
    
    print(f"Caminho do arquivo de licença: {validator.license_file}")
    print()
    
    print("Executando validação...")
    is_valid, mensagem = validator.validar_licenca()
    
    print()
    print("RESULTADO:")
    print("-" * 60)
    if is_valid:
        print(f"✅ SUCESSO: {mensagem}")
        print()
        print("Detalhes da licença:")
        print(f"  - API Key: {validator.api_key}")
        print(f"  - Data de Expiração: {validator.expiration_date.strftime('%d/%m/%Y')}")
        print(f"  - Status: {validator.obter_status_licenca()}")
    else:
        print(f"❌ FALHA: {mensagem}")
    
    print("-" * 60)
    print()
    
    return is_valid


def test_resource_path():
    """Testa se o método _get_resource_path funciona corretamente."""
    from license_validator import LicenseValidator
    
    print("=" * 60)
    print("TESTE: Detecção de Caminho de Recursos")
    print("=" * 60)
    print()
    
    validator = LicenseValidator()
    
    # Verificar se está rodando como executável ou script
    if hasattr(sys, '_MEIPASS'):
        print("✅ Detectado: Rodando como EXECUTÁVEL PyInstaller")
        print(f"   Diretório temporário: {sys._MEIPASS}")
    else:
        print("✅ Detectado: Rodando como SCRIPT Python")
        print(f"   Diretório atual: {os.path.abspath('.')}")
    
    print()
    print(f"Caminho do recurso 'license.key': {validator.license_file}")
    print()
    
    if os.path.exists(validator.license_file):
        print("✅ Arquivo encontrado no caminho correto!")
    else:
        print("❌ Arquivo NÃO encontrado no caminho!")
    
    print()


if __name__ == "__main__":
    print()
    print("🔧 TESTE DE CORREÇÃO DO LICENSE VALIDATOR")
    print()
    
    # Teste 1: Detecção de caminho
    test_resource_path()
    
    # Teste 2: Validação de licença
    success = test_license_validator()
    
    print()
    print("=" * 60)
    if success:
        print("✅ TODOS OS TESTES PASSARAM!")
        print()
        print("A correção está funcionando corretamente.")
        print("Você pode recompilar o executável com segurança.")
    else:
        print("❌ ALGUNS TESTES FALHARAM!")
        print()
        print("Verifique se o arquivo license.key está na pasta correta.")
    print("=" * 60)
    print()
