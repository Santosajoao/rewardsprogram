"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Link,
  Grid,
  Divider,
  Stack,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase";

// Tipo para controlar o modo do formulário
type AuthMode = "login" | "register" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleAuthAction = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "register") {
        if (!nome) throw new Error("O nome é obrigatório para o registo.");
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: nome });
        setSuccess("Conta criada com sucesso! Pode agora fazer o login.");
        setMode("login");
      } else if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Login efetuado com sucesso! A redirecionar...");
        window.location.href = "/home";
      } else if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setSuccess(
          "Email de recuperação de senha enviado! Verifique a sua caixa de entrada."
        );
        setMode("login");
      }
    } catch (err: any) {
      // Traduz as mensagens de erro comuns do Firebase
      switch (err.code) {
        case "auth/user-not-found":
          setError("Nenhum utilizador encontrado com este email.");
          break;
        case "auth/wrong-password":
          setError("Senha incorreta.");
          break;
        case "auth/email-already-in-use":
          setError("Este email já está a ser utilizado.");
          break;
        case "auth/weak-password":
          setError("A senha deve ter pelo menos 6 caracteres.");
          break;
        default:
          setError(err.message || "Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSuccess("Login com Google efetuado com sucesso! A redirecionar...");
      window.location.href = "/home";
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login com Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // // ATUALIZADO: Handler para o login com Apple
  // const handleAppleSignIn = async () => {
  //   setIsLoading(true);
  //   setError("");
  //   setSuccess("");
  //   const provider = new OAuthProvider("apple.com");

  //   // Solicita as permissões de email e nome
  //   provider.addScope("email");
  //   provider.addScope("name");

  //   try {
  //     const result = await signInWithPopup(auth, provider);

  //     // Informações do utilizador
  //     const user = result.user;

  //     // Credenciais da Apple (úteis para integrações mais avançadas)
  //     const credential = OAuthProvider.credentialFromResult(result);
  //     if (credential) {
  //       const accessToken = credential.accessToken;
  //       const idToken = credential.idToken;
  //     }

  //     setSuccess("Login com Apple efetuado com sucesso! A redirecionar...");
  //     // window.location.href = '/dashboard';

  //   } catch (err: any) {
  //     if (err.code === "auth/popup-closed-by-user") {
  //       setError("A janela de login foi fechada antes da conclusão.");
  //     } else {
  //       setError(err.message || "Erro ao fazer login com Apple.");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getTitle = () => {
    if (mode === "login") return "Acessar Conta";
    if (mode === "register") return "Criar Nova Conta";
    return "Recuperar Senha";
  };

  const getButtonText = () => {
    if (mode === "login") return "Entrar";
    if (mode === "register") return "Registrar";
    return "Enviar Email de Recuperação";
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography variant="h4" component="h1">
          {getTitle()}
        </Typography>

        <Box component="form" sx={{ width: "100%", mt: 1 }}>
          {mode === "register" && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          )}

          {mode !== "reset" && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Endereço de Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus={mode !== "register"}
            />
          )}

          {mode === "reset" && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Endereço de Email para Recuperação"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          )}

          {mode !== "reset" && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          )}

          {error && (
            <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleAuthAction}
            disabled={isLoading}
          >
            {isLoading && mode !== "login" && mode !== "register" ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              getButtonText()
            )}
            {isLoading && (mode === "login" || mode === "register") ? (
              <CircularProgress size={24} color="inherit" />
            ) : null}
            {/* {!isLoading && (mode === 'login' || mode === 'register') ? getButtonText() : null} */}
          </Button>

          <Grid container>
            <Grid size={12}>
              {mode === "login" && (
                <Link href="#" variant="body2" onClick={() => setMode("reset")}>
                  Esqueceu-se da senha?
                </Link>
              )}
            </Grid>
            <Grid size={12}>
              {mode === "login" ? (
                <Link
                  href="#"
                  variant="body2"
                  onClick={() => setMode("register")}
                >
                  {"Não tem uma conta? Registe-se"}
                </Link>
              ) : (
                <Link href="#" variant="body2" onClick={() => setMode("login")}>
                  {"Já tem uma conta? Entre"}
                </Link>
              )}
            </Grid>
          </Grid>
        </Box>

        {mode !== "reset" && (
          <>
            <Divider sx={{ width: "100%", my: 2 }}>OU</Divider>
            <Stack spacing={2} sx={{ width: "100%" }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                Continuar com Google
              </Button>
              {/* <Button
                fullWidth
                variant="outlined"
                startIcon={<AppleIcon />}
                onClick={handleAppleSignIn}
                disabled={isLoading}
                sx={{
                  color: "black",
                  borderColor: "rgba(0, 0, 0, 0.23)",
                }}
              >
                Continuar com Apple
              </Button> */}
            </Stack>
          </>
        )}
      </Box>
    </Container>
  );
}
