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
  IconButton,
  Button,
  Alert,
} from "@mui/material";
// MODIFICADO: Corrigidos os caminhos de importação para usar o alias '@'
import { formatarCPF, validarCPF } from "@/lib/utils";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  doc,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import EditIcon from "@mui/icons-material/Edit";
import BasicModal from "@/components/Modal";
import AppBar from "@/components/AppBar";
import CpfMaskAdapter from "@/components/CpfMaskAdapter";

interface Cliente {
  id: string;
  nome: string;
  ultimoCpfUtilizado: string;
  pontos: number;
  telefone?: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroCpf, setFiltroCpf] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );

  // Estados para os campos de edição
  const [editedNome, setEditedNome] = useState("");
  const [editedPontos, setEditedPontos] = useState("");
  const [editedTelefone, setEditedTelefone] = useState("");
  const [editedCpf, setEditedCpf] = useState("");
  const [editedCpfError, setEditedCpfError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "clientes"));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot) => {
      const clientesData: Cliente[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        clientesData.push({
          id: doc.id,
          nome: data.nome || "Nome não cadastrado",
          ultimoCpfUtilizado: data.cpf || "CPF não disponível",
          pontos: data.pontos || 0,
          telefone: data.telefone || "",
        });
      });
      clientesData.sort((a, b) => b.pontos - a.pontos);
      setClientes(clientesData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setEditedNome(cliente.nome);
    setEditedPontos(String(cliente.pontos));
    setEditedTelefone(cliente.telefone || "");
    setEditedCpf(formatarCPF(cliente.ultimoCpfUtilizado));
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setClienteSelecionado(null);
    setModalError("");
    setEditedCpfError("");
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoCpf = e.target.value;
    const cpfLimpo = novoCpf.replace(/\D/g, "");
    setEditedCpf(novoCpf);

    if (cpfLimpo.length === 11 && !validarCPF(cpfLimpo)) {
      setEditedCpfError("CPF inválido.");
    } else {
      setEditedCpfError("");
    }
  };

  const handleSaveChanges = async () => {
    if (!clienteSelecionado) return;

    const cpfLimpo = editedCpf.replace(/\D/g, "");
    if (editedCpfError) {
      setModalError("O CPF é inválido. Por favor, corrija.");
      return;
    }
    if (!cpfLimpo || cpfLimpo.length !== 11) {
      setModalError("O campo CPF é obrigatório e deve ter 11 dígitos.");
      return;
    }

    setIsSaving(true);
    setModalError("");

    try {
      if (cpfLimpo !== clienteSelecionado.ultimoCpfUtilizado) {
        const q = query(
          collection(db, "clientes"),
          where("cpf", "==", cpfLimpo)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setModalError("Este CPF já está em uso por outro cliente.");
          setIsSaving(false);
          return;
        }
      }

      const clienteRef = doc(db, "clientes", clienteSelecionado.id);
      await updateDoc(clienteRef, {
        nome: editedNome,
        pontos: Number(editedPontos),
        telefone: editedTelefone,
        cpf: cpfLimpo,
      });
      handleCloseModal();
    } catch (err: any) {
      if (err.code === "failed-precondition") {
        setModalError(
          "Erro de base de dados: Índice necessário para a consulta de CPF. Verifique a consola do navegador para o link de criação."
        );
      } else {
        console.error("Erro ao atualizar o documento: ", err);
        setModalError("Falha ao salvar as alterações. Tente novamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const clientesFiltrados =
    filtroCpf.trim() === ""
      ? clientes
      : clientes.filter((cliente) =>
          cliente.ultimoCpfUtilizado.includes(filtroCpf)
        );

  return (
    <>
      <AppBar />
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Ranking de Clientes 🏆
          </Typography>

          <TextField
            label="Buscar por CPF"
            variant="outlined"
            fullWidth
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            sx={{ mb: 2, maxWidth: "500px" }}
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
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Pontos
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Contato</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="right">
                        Editar
                      </TableCell>
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
                        <TableCell align="center">{cliente.pontos}</TableCell>
                        <TableCell>{cliente.telefone}</TableCell>
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

        {modalOpen && clienteSelecionado && (
          <BasicModal open={modalOpen} onClose={handleCloseModal}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Editar Cliente
            </Typography>
            <Box component="form" sx={{ mt: 2 }} noValidate autoComplete="off">
              <TextField
                fullWidth
                label="Nome"
                value={editedNome}
                onChange={(e) => setEditedNome(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="CPF"
                value={editedCpf}
                onChange={handleCpfChange}
                error={!!editedCpfError}
                helperText={editedCpfError || " "}
                sx={{ mb: 2 }}
                InputProps={{
                  inputComponent: CpfMaskAdapter as any,
                }}
              />
              <TextField
                fullWidth
                label="Pontos"
                type="number"
                value={editedPontos}
                onChange={(e) => setEditedPontos(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Telefone"
                value={editedTelefone}
                onChange={(e) => setEditedTelefone(e.target.value)}
                sx={{ mb: 2 }}
              />
              {modalError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {modalError}
                </Alert>
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button onClick={handleCloseModal} sx={{ mr: 1 }}>
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </Box>
            </Box>
          </BasicModal>
        )}
      </Container>
    </>
  );
}
