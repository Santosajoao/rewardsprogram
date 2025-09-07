"use client";
import React, { useState } from "react";
import { Box, Container, TextField, Button, Typography } from "@mui/material";
import CpfMaskAdapter from "../components/CpfMaskAdapter";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { validarCPF } from "../lib/utils";

// --- IMPORTS ATUALIZADOS DO FIREBASE ---
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

export default function AddPointsPage() {
  const [cpf, setCpf] = useState("");
  const [pontos, setPontos] = useState("");
  const [cpfError, setCpfError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState("");
  // const [apiResponse, setApiResponse] = useState<string>(""); // REMOVIDO

const handleAdicionarPontos = async () => {
    if (!!cpfError || !cpf || !pontos) {
      alert("Formulário inválido. Verifique o CPF e os pontos.");
      return;
    }

    setIsLoading(true);
    
    const cpfLimpo = cpf.replace(/\D/g, "");
    const pontosParaAdd = parseInt(pontos, 10);
    const nomeLimpo = nome.trim();

    try {
      const clientesRef = collection(db, "clientes");
      const q = query(clientesRef, where("cpf", "==", cpfLimpo));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // --- LÓGICA A: NOVO CLIENTE ---
        const payloadNovoCliente: any = {
          cpf: cpfLimpo,
          ultimoCpfUtilizado: cpf, 
          pontos: pontosParaAdd, 
          criadoEm: new Date(),
          ultimaAtualizacao: new Date(),
        };
        
        if (nomeLimpo !== "") {
          payloadNovoCliente.nome = nomeLimpo;
        }

        await addDoc(clientesRef, payloadNovoCliente);
        
        // --- ALERTA ATUALIZADO (NOVO CLIENTE) ---
        // Prioriza o nome digitado; se vazio, usa o CPF formatado como fallback.
        const nomeExibicao = nomeLimpo || `Cliente CPF ${cpf}`;
        alert(
          `Sucesso! ${pontosParaAdd} pontos adicionados para: ${nomeExibicao}.`
        );

      } else {
        // --- LÓGICA B: CLIENTE EXISTENTE ---
        const clienteDoc = querySnapshot.docs[0];
        const dadosCliente = clienteDoc.data(); // Pegamos os dados existentes

        const updatePayload: any = {
          pontos: increment(pontosParaAdd), 
          ultimaAtualizacao: new Date(),
          ultimoCpfUtilizado: cpf, 
        };

        if (nomeLimpo !== "") {
          updatePayload.nome = nomeLimpo;
        }

        await updateDoc(clienteDoc.ref, updatePayload);
        
        // --- ALERTA ATUALIZADO (CLIENTE EXISTENTE) ---
        // Prioriza: 1. Nome recém-digitado, OU 2. Nome já existente no DB, OU 3. CPF formatado.
        const nomeExibicao = nomeLimpo || dadosCliente.nome || `Cliente CPF ${cpf}`;
        alert(
          `Sucesso! ${pontosParaAdd} pontos adicionados para: ${nomeExibicao}.`
        );
      }

      // Limpar campos em ambos os casos (Sucesso)
      setCpf("");
      setPontos("");
      setNome("");

    } catch (error: any) {
      console.error("ERRO NA OPERAÇÃO DO FIRESTORE:", error);

      // (Alertas de erro permanecem os mesmos, pois não mostram ID ou nome)
      if (error.code === "failed-precondition") {
        alert(
          "Erro: O banco de dados precisa de um índice. Verifique o console do navegador para o link de criação."
        );
      } else {
        alert(`Erro: Falha na operação. ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoCpf = e.target.value;
    setCpf(novoCpf);
    // setApiResponse(""); // REMOVIDO

    if (novoCpf.length === 0) {
      setCpfError("");
    } else if (novoCpf.length === 14) {
      if (validarCPF(novoCpf)) {
        setCpfError("");
      } else {
        setCpfError("CPF inválido.");
      }
    } else {
      setCpfError("");
    }
  };

  return (
    <>
     
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Registrar Pontos do Cliente 🪙
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            label="Nome do Cliente (Opcional)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            helperText="O nome só é salvo/atualizado se preenchido."
          />

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
              inputComponent: CpfMaskAdapter as any,
            }}
            error={!!cpfError}
            helperText={cpfError || " "}
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
              // setApiResponse(""); // REMOVIDO
            }}
            helperText=" "
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
            {isLoading ? "Salvando..." : "Adicionar Pontos"}
          </Button>

          {/* Feedback da API (BLOCO INTEIRO REMOVIDO) */}
        </Box>
      </Container>
    </>
  );
}
