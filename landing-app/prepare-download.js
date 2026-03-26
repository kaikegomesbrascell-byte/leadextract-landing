import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar pasta de downloads se não existir
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Arquivos do lead extractor para incluir no ZIP
const filesToInclude = [
  '../lead-extractor-app/dist/LeadExtractor.exe',  // Executável
  '../lead-extractor-app/README.md',                // Instruções
];

// Criar arquivo ZIP
const output = fs.createWriteStream(path.join(downloadsDir, 'lead-extractor.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 }, // Máxima compressão
});

output.on('close', () => {
  console.log('✅ Arquivo ZIP criado com sucesso!');
  console.log(`📦 Tamanho: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📍 Local: ${path.join(downloadsDir, 'lead-extractor.zip')}`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Adicionar arquivos ao ZIP
filesToInclude.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fileName = path.basename(filePath);
    archive.file(filePath, { name: fileName });
    console.log(`📄 Adicionado: ${fileName}`);
  } else {
    console.warn(`⚠️  Arquivo não encontrado: ${file}`);
  }
});

// Adicionar README com instruções
const readmeContent = `# Lead Extractor - Google Maps

## 🎉 Bem-vindo!

Obrigado por adquirir o Lead Extractor!

## 🚀 Como Usar

### Executando o Software

1. **Descompacte o arquivo ZIP**
2. **Dê duplo clique em LeadExtractor.exe**
3. **Pronto!** A interface gráfica vai abrir

**IMPORTANTE:** Não precisa instalar Python ou dependências. O executável já contém tudo!

### Fluxo de Uso

1. **Preencha os campos**:
   - Nicho/Palavra-chave (ex: "restaurantes", "dentistas")
   - Localização/Cidade (ex: "São Paulo", "Rio de Janeiro")
   - Limite de leads (50, 100 ou 500)

2. **Clique em "Iniciar Extração"**:
   - A extração começará automaticamente
   - Os dados aparecerão em tempo real na tabela

3. **Acompanhe o progresso**:
   - Barra de progresso mostra o andamento
   - Tabela é atualizada conforme leads são extraídos
   - Use o botão "Parar" se necessário

4. **Exporte os dados**:
   - Clique em "Exportar"
   - Escolha o formato (Excel ou CSV)
   - Selecione o local e nome do arquivo
   - Pronto! Seus leads estão salvos

## 📊 Dados Extraídos

Para cada empresa, o sistema extrai:
- Nome da Empresa
- Telefone
- Site
- Nota/Rating
- Quantidade de Comentários
- Endereço Completo

## 🐛 Solução de Problemas

### Antivírus bloqueia o executável

**Normal!** Alguns antivírus detectam executáveis Python como falso positivo.

**Solução:**
- Adicione exceção no antivírus
- Ou execute mesmo assim (o arquivo é seguro)

### Interface não responde

- Aguarde o término da extração
- Use o botão "Parar" se necessário

### Dados não são extraídos

- Verifique sua conexão com a internet
- O Google Maps pode ter mudado a estrutura da página

## 📞 Suporte

Para suporte técnico, entre em contato conosco.

---

**Versão**: 1.0.0  
**Data de Compra**: ${new Date().toLocaleDateString('pt-BR')}

**IMPORTANTE:** Este software é licenciado para uso pessoal ou comercial.
Não compartilhe o executável com outras pessoas.
`;

archive.append(readmeContent, { name: 'INSTRUCOES.md' });

archive.finalize();
