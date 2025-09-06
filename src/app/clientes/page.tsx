"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  TextField, // NOVO: Importar o campo de texto para a busca
} from "@mui/material";
import ResponsiveAppBar from "../../components/AppBar";
import { formatarCPF } from "../../lib/utils";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";

interface Cliente {
  id: string;
  nome: string;
  ultimoCpfUtilizado: string;
  pontos: number;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroCpf, setFiltroCpf] = useState(""); // NOVO: Estado para guardar o valor da search bar

  // Este useEffect (busca de dados) permanece O MESMO.
  useEffect(() => {
    const q = query(collection(db, "clientes"));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot) => {
      const clientesData: Cliente[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        clientesData.push({
          id: doc.id,
          nome: data.nome || "Nome não cadastrado",
          // MODIFICADO: Corrigindo para usar o campo 'cpf' vindo do banco para formatar
          ultimoCpfUtilizado: data.cpf
            ? data.cpf
            : "CPF não disponível",
          pontos: data.pontos || 0,
        });
      });

      clientesData.sort((a, b) => b.pontos - a.pontos);

      setClientes(clientesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // NOVO: Lógica de filtragem
  // Criamos uma lista derivada baseada no estado 'clientes' e no estado 'filtroCpf'
  const clientesFiltrados =
    filtroCpf.trim() === ""
      ? clientes // Se o filtro estiver vazio, mostra todos os clientes
      : clientes.filter(
          (cliente) =>
            // Verifica se o texto do filtro existe no CPF formatado OU no ID (CPF limpo)
            cliente.ultimoCpfUtilizado.includes(filtroCpf) ||
            cliente.id.includes(filtroCpf)
        );

  return (
    <>
      {/* <ResponsiveAppBar />  // Removi da resposta para focar, mas mantenha o seu. */}
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Ranking de Clientes 🏆
          </Typography>

          {/* NOVO: Campo de busca (Search Bar) */}
          <TextField
            label="Buscar por CPF"
            variant="outlined"
            fullWidth
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            sx={{ mb: 2 }} // Adiciona um espaço abaixo do campo
          />

          {isLoading ? (
            <CircularProgress />
          ) : (
            <Paper sx={{ width: "100%" }}>
              <TableContainer>
                <Table stickyHeader aria-label="tabela de clientes">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>CPF</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        Pontos
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {/* MODIFICADO: Trocamos 'clientes.map' por 'clientesFiltrados.map' */}
                    {clientesFiltrados.map((cliente) => (
                      <TableRow
                        key={cliente.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {cliente.nome}
                        </TableCell>
                        <TableCell>{formatarCPF(cliente.ultimoCpfUtilizado)}</TableCell>
                        <TableCell align="right">{cliente.pontos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      </Container>
    </>
  );
}
