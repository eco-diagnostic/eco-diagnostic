"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InstitutionSize } from "@prisma/client";
import { createInstitutionAction } from "@/app/_actions/institution-actions";
import type { InstitutionFormData } from "@/app/_actions/institution-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Building2,
  MapPin,
  Briefcase,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
  GraduationCap,
  Store,
  Factory,
  HelpCircle,
} from "lucide-react";

interface SizeOption {
  value: InstitutionSize;
  title: string;
  subtitle: string;
  icon: typeof Users;
}

const SIZE_OPTIONS: SizeOption[] = [
  {
    value: InstitutionSize.MICRO,
    title: "Microempresa",
    subtitle: "Até 9 colaboradores",
    icon: Store,
  },
  {
    value: InstitutionSize.PEQUENA,
    title: "Pequeno Porte",
    subtitle: "10 a 49 colaboradores",
    icon: Users,
  },
  {
    value: InstitutionSize.MEDIA,
    title: "Médio Porte",
    subtitle: "50 a 99 colaboradores",
    icon: Building2,
  },
  {
    value: InstitutionSize.GRANDE,
    title: "Grande Porte",
    subtitle: "100+ colaboradores",
    icon: Factory,
  },
  {
    value: InstitutionSize.INSTITUICAO_ENSINO,
    title: "Instituição de Ensino",
    subtitle: "Escolas, Faculdades e Universidades",
    icon: GraduationCap,
  },
  {
    value: InstitutionSize.OUTRO,
    title: "Outro Formato",
    subtitle: "ONGs, Cooperativas e Setor Público",
    icon: HelpCircle,
  },
];

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const COMMON_SECTORS = [
  "Educação",
  "Tecnologia",
  "Saúde",
  "Indústria",
  "Comércio",
  "Serviços",
  "Agronegócio",
  "Terceiro Setor",
];

export function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<InstitutionFormData>({
    name: "",
    sector: "",
    city: "",
    state: "SP",
    size: InstitutionSize.PEQUENA,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof InstitutionFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validações básicas no cliente
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "O nome da instituição é obrigatório.";
    }
    if (!formData.sector.trim()) {
      newErrors.sector = "O ramo / setor de atuação é obrigatório.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "A cidade é obrigatória.";
    }
    if (!formData.state.trim()) {
      newErrors.state = "O estado é obrigatório.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const res = await createInstitutionAction(formData);

      if (res.success) {
        toast.success("Instituição configurada com sucesso!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error || "Não foi possível salvar os dados.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <Card className="border-green-200 shadow-xl dark:border-green-950">
        <CardHeader className="space-y-3 pb-6 text-center border-b border-gray-100 dark:border-gray-800">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
            <Building2 className="size-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Cadastre sua Instituição
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">
              Para personalizar seus diagnósticos ambientais e relatórios inteligentes,
              informe os dados essenciais da sua organização.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* NOME DA INSTITUIÇÃO */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 font-semibold">
              <Building2 className="size-4 text-green-600" />
              Nome da Instituição ou Empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Instituto de Tecnologia Verde, Hospital São Lucas, Empresa XYZ..."
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={loading}
              className={`h-11 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500">{errors.name}</p>
            )}
          </div>

          {/* RAMO / SETOR DE ATUAÇÃO */}
          <div className="space-y-2">
            <Label htmlFor="sector" className="flex items-center gap-2 font-semibold">
              <Briefcase className="size-4 text-green-600" />
              Setor / Ramo de Atuação <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sector"
              placeholder="Ex: Educação / Acadêmico, Saúde, Tecnologia, Indústria..."
              value={formData.sector}
              onChange={(e) => handleInputChange("sector", e.target.value)}
              disabled={loading}
              className={`h-11 ${errors.sector ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.sector && (
              <p className="text-xs font-medium text-red-500">{errors.sector}</p>
            )}

            {/* SUGESTÕES RÁPIDAS */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground mr-1">Sugestões:</span>
              {COMMON_SECTORS.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => handleInputChange("sector", sector)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    formData.sector === sector
                      ? "bg-green-600 text-white border-green-600 font-medium"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground border-transparent"
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* LOCALIZAÇÃO (CIDADE E ESTADO) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="city" className="flex items-center gap-2 font-semibold">
                <MapPin className="size-4 text-green-600" />
                Cidade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Ex: São Paulo, Campinas, Curitiba..."
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                disabled={loading}
                className={`h-11 ${errors.city ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {errors.city && (
                <p className="text-xs font-medium text-red-500">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="font-semibold">
                Estado (UF) <span className="text-red-500">*</span>
              </Label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                disabled={loading}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {UF_OPTIONS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PORTE DA INSTITUIÇÃO */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold">
              <Users className="size-4 text-green-600" />
              Porte da Instituição <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SIZE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.size === opt.value;

                return (
                  <div
                    key={opt.value}
                    onClick={() => !loading && handleInputChange("size", opt.value)}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "border-green-600 bg-green-50/70 shadow-sm ring-2 ring-green-600/20 dark:bg-green-950/40 dark:border-green-500"
                        : "border-border hover:border-green-300 hover:bg-muted/50"
                    } ${loading ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {opt.title}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="size-4 text-green-600 shrink-0 ml-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DESCRIÇÃO OPCIONAL */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2 font-semibold">
              <FileText className="size-4 text-green-600" />
              Descrição / Apresentação <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Breve resumo sobre a atuação, compromissos ecológicos ou características principais da instituição..."
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={loading}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 bg-muted/20">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            🔒 Seus dados serão utilizados apenas para calibrar seus diagnósticos e relatórios.
          </p>

          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-w-[200px] gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-5 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Concluir Cadastro
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
