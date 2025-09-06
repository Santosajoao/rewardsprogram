"use client";
import React, { useState } from "react";
import { Box, Container, TextField, Button, Typography } from "@mui/material";
import CpfMaskAdapter from "../components/CpfMaskAdapter"; // Importando o TSX
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ResponsiveAppBar from "../components/AppBar";
import { validarCPF } from "../lib/utils"; // Importando o TS

export default function AddPointsPage() {

  const [cpf, setCpf] = useState("");
  const [pontos, setPontos] = useState("");
  const [cpfError, setCpfError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string>(""); // Bônus: estado para resposta da API

  const handleAdicionarPontos = async () => { // Recomendado: transformar em async
    
    // A validação de CPF já foi feita no onChange, mas checamos de novo
    if (!!cpfError || !cpf || !pontos) {
      alert("Formulário inválido. Verifique o CPF e os pontos.");
      return;
    }
    
    setIsLoading(true);
    setApiResponse(""); // Limpa respostas antigas

    // Lógica real da API (substituindo o alert)
    try {
      const cpfLimpo = cpf.replace(/\D/g, ""); // Envia só os números
      
      // Simulação de chamada de API (substitua pelo seu fetch)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sucesso (simulado)
      console.log("Enviando:", { cpf: cpfLimpo, pontos: parseInt(pontos) });
      setApiResponse(`Sucesso! ${pontos} pontos adicionados ao CPF ${cpf}.`);

      // Limpar campos
      setCpf("");
      setPontos("");

    } catch (error: any) {
      console.error(error);
      setApiResponse(`Erro: ${error.message || "Não foi possível adicionar os pontos."}`);
      setCpfError("Erro na API."); // Indica um erro geral
    } finally {
      setIsLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoCpf = e.target.value;
    setCpf(novoCpf);
    setApiResponse(""); // Limpa a resposta da API ao digitar de novo

    if (novoCpf.length === 0) {
      setCpfError("");
    } else if (novoCpf.length === 14) {
      if (validarCPF(novoCpf)) {
        setCpfError("");
      } else {
        setCpfError("CPF inválido.");
      }
    } else {
      // Limpa o erro ENQUANTO digita
      setCpfError("");
    }
  };

  return (
    <>
      <ResponsiveAppBar />
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Registrar Pontos do Cliente 🪙
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            label="CPF do Cliente"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            name="cpf-input"
            id="cpf-mask-input"
            InputProps={{
              inputComponent: CpfMaskAdapter as any, // Este 'as any' é pragmático e aceitável aqui
            }}
            error={!!cpfError}
            helperText={cpfError || " "} // Use " " para manter a altura do layout
          />

          <TextField
            fullWidth
            variant="outlined"
            label="Pontos a Adicionar"
            type="number"
            InputProps={{ inputProps: { min: 1 } }}
            value={pontos}
            onChange={(e) => {
                setPontos(e.target.value);
                setApiResponse(""); // Limpa resposta ao digitar
            }}
            helperText=" " // Mantém o layout alinhado com o helperText do CPF
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAdicionarPontos}
            disabled={!cpf || !pontos || isLoading || !!cpfError}
          >
            {isLoading ? "Adicionando..." : "Adicionar Pontos"}
          </Button>

          {/* Feedback da API */}
          {apiResponse && (
            <Typography color={apiResponse.startsWith("Erro:") ? "error" : "primary"}>
                {apiResponse}
            </Typography>
          )}

        </Box>
      </Container>
    </>
  );
}