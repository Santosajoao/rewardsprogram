"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Grid,
  Alert,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import {
  doc,
  getDoc,
  setDoc,
  DocumentData,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// MODIFICADO: Corrigido o caminho de importação para usar o alias '@'
import { db, storage, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { validarCPF } from "@/lib/utils";
import CpfMaskAdapter from "@/components/CpfMaskAdapter";
import ResponsiveAppBar from "@/components/AppBar";

// A interface dos dados do cliente permanece a mesma
interface Cliente {
  nome: string;
  cpf: string;
  telefone?: string;
  fotoPerfilURL?: string;
}

export default function EditarPerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState<string>("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchCliente = async () => {
      setIsLoading(true);
      try {
        const clienteRef = doc(db, "clientes", user.uid);
        const docSnap = await getDoc(clienteRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DocumentData;
          const clienteData: Cliente = {
            nome: data.nome || user.displayName || "",
            cpf: data.cpf || "",
            telefone: data.telefone || "",
            fotoPerfilURL: data.fotoPerfilURL || user.photoURL || "",
          };
          setCliente(clienteData);
          setNome(clienteData.nome);
          setTelefone(clienteData.telefone || "");
          setCpf(clienteData.cpf || "");
          setImagemPreview(clienteData.fotoPerfilURL || null);
        } else {
          setError("Perfil não encontrado. Por favor, complete os seus dados.");
          setNome(user.displayName || "");
          setImagemPreview(user.photoURL || null);
        }
      } catch (err) {
        setError("Erro ao buscar dados do cliente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCliente();
  }, [user]);

  const handleImagemChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagemFile(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoCpf = e.target.value;
    // Remove a formatação para a validação
    const cpfLimpo = novoCpf.replace(/\D/g, "");
    setCpf(novoCpf);

    if (cpfLimpo.length === 11 && !validarCPF(cpfLimpo)) {
      setCpfError("CPF inválido.");
    } else {
      setCpfError("");
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("Precisa de estar autenticado para salvar.");
      return;
    }
    if (cpfError) {
      setError("O CPF é inválido. Por favor, corrija antes de salvar.");
      return;
    }
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!cpfLimpo) {
      setError("O campo CPF é obrigatório.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!cliente?.cpf) {
        const q = query(
          collection(db, "clientes"),
          where("cpf", "==", cpfLimpo)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const isDuplicate = querySnapshot.docs.some(
            (doc) => doc.id !== user.uid
          );
          if (isDuplicate) {
            setError("Este CPF já está em uso por outra conta.");
            setIsSaving(false);
            return;
          }
        }
      }

      let novaFotoURL = imagemPreview;

      if (imagemFile) {
        const storageRef = ref(
          storage,
          `fotos_perfil/${user.uid}/${imagemFile.name}`
        );
        const uploadResult = await uploadBytes(storageRef, imagemFile);
        novaFotoURL = await getDownloadURL(uploadResult.ref);
      }

      const dadosParaSalvar: any = {
        nome: nome,
        telefone: telefone,
        fotoPerfilURL: novaFotoURL || "",
        email: user.email,
        ultimaAtualizacao: new Date(),
      };

      if (!cliente?.cpf) {
        dadosParaSalvar.cpf = cpfLimpo;
      }

      const clienteRef = doc(db, "clientes", user.uid);
      await setDoc(clienteRef, dadosParaSalvar, { merge: true });

      setSuccess("Perfil atualizado com sucesso!");
      setImagemFile(null);
    } catch (err: any) {
      if (err.code === "failed-precondition") {
        setError(
          "Erro de base de dados: Índice necessário não encontrado. Verifique a consola do navegador para o link de criação."
        );
      } else {
        setError("Erro ao salvar o perfil.");
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Alert severity="error">
          Acesso negado. Por favor, faça o login para editar o seu perfil.
        </Alert>
        <Button variant="contained" href="/login" sx={{ mt: 2 }}>
          Ir para Login
        </Button>
      </Container>
    );
  }

  return (
    <>
      <ResponsiveAppBar />
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography variant="h4" component="h1">
            Editar Perfil
          </Typography>

          <Box sx={{ position: "relative" }}>
            <Avatar
              src={imagemPreview || undefined}
              sx={{ width: 120, height: 120, fontSize: "4rem" }}
            >
              {nome.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "white",
                "&:hover": { backgroundColor: "lightgray" },
              }}
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImagemChange}
              />
              <PhotoCamera />
            </IconButton>
          </Box>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="CPF"
                value={cpf}
                placeholder="000.000.000-00"
                onChange={handleCpfChange}
                error={!!cpfError}
                helperText={cpfError || " "}
                disabled={!!cliente?.cpf}
                name="cpf-input"
                id="cpf-mask-input"
                InputProps={{
                  inputComponent: CpfMaskAdapter as any,
                }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ width: "100%" }}>
              {success}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSave}
            disabled={isSaving}
            sx={{ mt: 2 }}
          >
            {isSaving ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </Box>
      </Container>
    </>
  );
}
