import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Globe, MapPin, Star, MessageSquare } from "lucide-react";

const LeadsExampleSection = () => {
  const exampleLeads = [
    {
      name: "Sampa Sky",
      phone: "N/A",
      website: "www.sampasky.com.br",
      rating: "4.5",
      reviews: "277",
      address: "Praca Pedro Lessa, 110 - Centro Histórico de São Paulo, São Paulo - SP"
    },
    {
      name: "Ps Do Vidro",
      phone: "(11) 5555-6980",
      website: "www.psdovidro.com.br",
      rating: "4.5",
      reviews: "277",
      address: "R. Gomes de Carvalho, 477 - Vila Olímpia, São Paulo - SP"
    },
    {
      name: "VITEC VIDROS SÃO PAULO",
      phone: "(11) 2385-7785",
      website: "www.vitecvidros.ind.br",
      rating: "4.5",
      reviews: "277",
      address: "Rua Dr. Malta Cardoso, 397 - Vila Gumercindo, São Paulo - SP"
    },
    {
      name: "Ideia Glass",
      phone: "(11) 3016-9300",
      website: "www.ideiaglass.com.br",
      rating: "4.5",
      reviews: "277",
      address: "R. Treze de Maio, 911 - Bela Vista, São Paulo - SP"
    },
    {
      name: "Modular Vidros",
      phone: "(11) 3384-1371",
      website: "www.modularvidros.com.br",
      rating: "4.5",
      reviews: "277",
      address: "Av. Armando Ferrentini, 63 - LOJA 03 - Paraíso, São Paulo - SP"
    },
    {
      name: "Mirante Vidros - Vidraçaria",
      phone: "(11) 93000-8010",
      website: "www.mirantevidros.com.br",
      rating: "4.5",
      reviews: "277",
      address: "R. Tebas, 451 - Campo Belo, São Paulo - SP"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Exemplo Real
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Veja Leads Reais Extraídos
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Estes são exemplos reais de leads extraídos com a busca "Vidro" em "São Paulo". 
            Total de 37 leads únicos extraídos em poucos minutos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {exampleLeads.map((lead, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{lead.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{lead.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{lead.reviews} avaliações</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{lead.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Globe className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">{lead.website}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground line-clamp-2">{lead.address}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-lg">
            <span className="font-semibold">✅ 37 leads únicos extraídos</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Sem duplicatas</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Dados completos</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadsExampleSection;
