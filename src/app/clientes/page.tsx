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
  TextField,
  IconButton, // NOVO: Para tornar o ícone um botão clicável
} from "@mui/material";
import { formatarCPF } from "../../lib/utils";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import EditIcon from "@mui/icons-material/Edit";
import BasicModal from "../../components/Modal"; // Este componente já estava importado

interface Cliente {
  id: string;
  nome: string;
  ultimoCpfUtilizado: string;
  pontos: number;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroCpf, setFiltroCpf] = useState("");

  // --- NOVOS ESTADOS PARA O MODAL ---
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );

  // useEffect (busca de dados) - SEM ALTERAÇÕES
  useEffect(() => {
    const q = query(collection(db, "clientes"));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot) => {
      const clientesData: Cliente[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        clientesData.push({
          id: doc.id,
          nome: data.nome || "Nome não cadastrado",
          ultimoCpfUtilizado: data.cpf ? data.cpf : "CPF não disponível",
          pontos: data.pontos || 0,
        });
      });
      clientesData.sort((a, b) => b.pontos - a.pontos);
      setClientes(clientesData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- NOVAS FUNÇÕES PARA CONTROLAR O MODAL ---

  /** Abre o modal e define qual cliente está sendo editado */
  const handleOpenModal = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setModalOpen(true);
  };

  /** Fecha o modal e limpa o cliente selecionado */
  const handleCloseModal = () => {
    setModalOpen(false);
    setClienteSelecionado(null);
  };

  // Lógica de filtragem - SEM ALTERAÇÕES
  const clientesFiltrados =
    filtroCpf.trim() === ""
      ? clientes
      : clientes.filter(
          (cliente) =>
            cliente.ultimoCpfUtilizado.includes(filtroCpf) ||
            cliente.id.includes(filtroCpf)
        );

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Ranking de Clientes 🏆
          </Typography>

          <TextField
            // ...props do textfield (sem alterações)
            label="Buscar por CPF"
            variant="outlined"
            fullWidth
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            sx={{ mb: 2 }}
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
                      <TableCell sx={{ fontWeight: "bold" }} align="right">Editar</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
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
                        <TableCell>
                          {formatarCPF(cliente.ultimoCpfUtilizado)}
                        </TableCell>
                        <TableCell align="right">{cliente.pontos}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenModal(cliente)}>
                            <EditIcon color="inherit" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>

        {/* NOVO: Renderização condicional do Modal.
          Ele só renderiza se o modalOpen for true E tivermos um cliente selecionado.
        */}
        {modalOpen && clienteSelecionado && (
          <BasicModal
            open={modalOpen}
            onClose={handleCloseModal} // Passando a função de fechar
            // O conteúdo do modal é definido aqui
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Editar Cliente
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Nome: {clienteSelecionado.nome}
              <br />
              CPF: {formatarCPF(clienteSelecionado.ultimoCpfUtilizado)}
              <br />
              Pontos: {clienteSelecionado.pontos}
            </Typography>
          </BasicModal>
        )}
      </Container>
    </>
  );
}
