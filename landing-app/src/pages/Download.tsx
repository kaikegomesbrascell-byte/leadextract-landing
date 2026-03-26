import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Download, Loader2, XCircle, FileArchive, Shield, Clock } from 'lucide-react';

export default function DownloadPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'downloading'>('loading');
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    // Verificar se o token é válido
    fetch(`http://localhost:3002/api/download/verify/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setStatus('valid');
          setDownloadInfo(data);
        } else {
          setStatus('invalid');
        }
      })
      .catch(() => {
        setStatus('invalid');
      });
  }, [token]);

  const handleDownload = () => {
    if (!token) return;
    
    setStatus('downloading');
    
    // Criar link de download
    const downloadUrl = `http://localhost:3002/api/download/${token}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'lead-extractor.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Atualizar status após 2 segundos
    setTimeout(() => {
      setStatus('valid');
      // Recarregar informações
      fetch(`http://localhost:3002/api/download/verify/${token}`)
        .then(res => res.json())
        .then(data => {
          setDownloadInfo(data);
        });
    }, 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="text-lg text-gray-600">Verificando seu acesso...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-8 w-8" />
              <CardTitle>Link Inválido ou Expirado</CardTitle>
            </div>
            <CardDescription>
              Este link de download não é válido ou já expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Possíveis motivos:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>O link já foi usado 3 vezes (limite atingido)</li>
                <li>O link expirou</li>
                <li>O link está incorreto</li>
              </ul>
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Voltar para a Página Inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
            <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          </div>
          <CardDescription className="text-base">
            Seu Lead Extractor está pronto para download
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <FileArchive className="h-5 w-5" />
              Informações do Download
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Cliente:</p>
                <p className="font-medium">{downloadInfo?.customer?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-medium">{downloadInfo?.customer?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Downloads restantes:</p>
                <p className="font-medium text-green-600">
                  {downloadInfo?.remainingDownloads || 0} de {downloadInfo?.maxDownloads || 3}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Tamanho do arquivo:</p>
                <p className="font-medium">~50 MB</p>
              </div>
            </div>
          </div>

          {/* Botão de Download */}
          <Button
            onClick={handleDownload}
            disabled={status === 'downloading' || (downloadInfo?.remainingDownloads || 0) <= 0}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
          >
            {status === 'downloading' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Baixando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Baixar Lead Extractor
              </>
            )}
          </Button>

          {/* Avisos Importantes */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Segurança</p>
                <p>Este link é único e pessoal. Não compartilhe com outras pessoas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Limite de Downloads</p>
                <p>Você pode baixar este arquivo até 3 vezes. Guarde bem o arquivo após o download.</p>
              </div>
            </div>
          </div>

          {/* O que você vai receber */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">📦 O que está incluído:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Software Lead Extractor completo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Todos os arquivos necessários
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Instruções de instalação detalhadas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Suporte técnico incluído
              </li>
            </ul>
          </div>

          {/* Próximos Passos */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-purple-900">🚀 Próximos Passos:</h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Baixe o arquivo ZIP clicando no botão acima</li>
              <li>Descompacte o arquivo em uma pasta de sua preferência</li>
              <li>Leia o arquivo INSTRUCOES.md para instalar</li>
              <li>Execute o Lead Extractor e comece a extrair leads!</li>
            </ol>
          </div>

          {/* Botão Voltar */}
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Voltar para a Página Inicial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
