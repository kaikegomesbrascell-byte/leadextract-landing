import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "O que são Intervalos Humanos Inteligentes e por que são importantes?",
      answer: "Intervalos Humanos Inteligentes são delays naturais e variações aleatórias entre cada ação do sistema (scroll, clique, leitura de dados). Isso simula o comportamento de uma pessoa real navegando no Google Maps, protegendo você de bloqueios e banimentos. Sem essa proteção, o Google Maps detecta que é um robô e bloqueia seu IP, e seu WhatsApp pode ser banido por spam ao enviar mensagens para leads extraídos de forma agressiva. É por isso que o sistema vale R$ 297,00 - ele protege seu investimento e garante extrações seguras a longo prazo."
    },
    {
      question: "Como funciona o Lead Extractor?",
      answer: "O Lead Extractor automatiza a busca de empresas no Google Maps. Você informa o nicho (ex: 'restaurantes') e a localização (ex: 'São Paulo'), e o sistema extrai automaticamente nome, telefone, site, endereço, nota e comentários de cada empresa encontrada."
    },
    {
      question: "Preciso instalar Python ou outras dependências?",
      answer: "Não! O executável (.exe) já contém tudo que você precisa. Basta descompactar o arquivo ZIP e dar duplo clique no LeadExtractor.exe. Não é necessário instalar Python, bibliotecas ou qualquer outra dependência."
    },
    {
      question: "Quantos leads posso extrair por vez?",
      answer: "Você pode escolher entre 50, 100 ou 500 leads por extração. O sistema extrai os dados em tempo real e você pode acompanhar o progresso pela barra de progresso e pela tabela que é atualizada conforme os leads são encontrados."
    },
    {
      question: "Em que formato os dados são exportados?",
      answer: "Os dados podem ser exportados em dois formatos: Excel (.xlsx) ou CSV (.csv). Além disso, o sistema gera automaticamente um arquivo de texto (.txt) na pasta Downloads com todos os leads extraídos, incluindo um relatório completo com data, hora e total de leads únicos."
    },
    {
      question: "O sistema remove leads duplicados?",
      answer: "Sim! O sistema possui um mecanismo inteligente de detecção de duplicatas. Cada lead aparece apenas uma vez no resultado final, mesmo que seja encontrado em diferentes buscas ou páginas do Google Maps."
    },
    {
      question: "Meu antivírus está bloqueando o executável. É seguro?",
      answer: "Sim, é completamente seguro! Alguns antivírus detectam executáveis Python como falso positivo. Isso é normal e acontece porque o PyInstaller (ferramenta usada para criar o .exe) empacota o Python e todas as bibliotecas em um único arquivo. Você pode adicionar uma exceção no antivírus ou executar mesmo assim - o arquivo não contém vírus."
    },
    {
      question: "Posso usar o Lead Extractor para qualquer nicho?",
      answer: "Sim! O sistema funciona para qualquer nicho de negócio que esteja no Google Maps: restaurantes, dentistas, advogados, salões de beleza, oficinas mecânicas, pet shops, academias, clínicas, lojas, e muito mais. Basta informar a palavra-chave do nicho que você deseja."
    },
    {
      question: "Como funciona a extração em tempo real?",
      answer: "Quando você clica em 'Iniciar Extração', o sistema abre o navegador Chromium em segundo plano, navega até o Google Maps, realiza a busca e extrai os dados de cada empresa. Você vê os leads aparecendo na tabela em tempo real, conforme são extraídos. Uma barra de progresso mostra o andamento da extração."
    },
    {
      question: "Posso parar a extração no meio do processo?",
      answer: "Sim! Há um botão 'Parar' que permite interromper a extração a qualquer momento. Os leads que já foram extraídos até aquele ponto ficam salvos e podem ser exportados normalmente."
    },
    {
      question: "O que acontece se minha internet cair durante a extração?",
      answer: "Se a conexão cair, a extração será interrompida. Os leads que já foram extraídos até aquele momento ficam salvos na tabela e podem ser exportados. Quando a internet voltar, você pode iniciar uma nova extração."
    },
    {
      question: "Os dados extraídos são atualizados?",
      answer: "Sim! Os dados são extraídos diretamente do Google Maps no momento da busca, então você sempre terá as informações mais recentes disponíveis na plataforma (telefones, endereços, sites, notas e comentários atualizados)."
    },
    {
      question: "Posso usar o Lead Extractor em vários computadores?",
      answer: "A licença é pessoal ou comercial. Você pode usar o software nos seus computadores, mas não deve compartilhar o executável com outras pessoas. Cada usuário deve adquirir sua própria licença."
    },
    {
      question: "Quanto tempo demora uma extração?",
      answer: "O tempo varia de acordo com a quantidade de leads solicitada e a velocidade da sua internet. Em média: 50 leads levam cerca de 2-3 minutos, 100 leads levam 5-7 minutos, e 500 leads podem levar 20-30 minutos. O sistema mostra o progresso em tempo real."
    },
    {
      question: "O Google Maps pode bloquear minha busca?",
      answer: "O sistema utiliza técnicas de automação que simulam comportamento humano (delays, scrolling natural, etc.) para minimizar o risco de bloqueio. No entanto, em casos de uso muito intensivo, o Google Maps pode temporariamente limitar as buscas. Recomendamos fazer pausas entre extrações grandes."
    },
    {
      question: "Preciso de conhecimentos técnicos para usar?",
      answer: "Não! A interface é super intuitiva e amigável. Basta preencher 3 campos (nicho, localização e limite de leads), clicar em 'Iniciar Extração' e aguardar. Depois, clique em 'Exportar' para salvar os dados. Qualquer pessoa consegue usar, mesmo sem conhecimentos técnicos."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tire suas dúvidas sobre o Lead Extractor
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
