"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import WhatshotIcon from "@mui/icons-material/Whatshot";
// NOVO: Importar 'useRouter' para o redirecionamento
import { useRouter } from "next/navigation";
// NOVO: Importar as funcionalidades de autenticação do Firebase
import { onAuthStateChanged, signOut, User } from "firebase/auth";
// MODIFICADO: Corrigido o caminho de importação para ser relativo
import { auth } from "../lib/firebase";

// Definimos os links fora do componente para maior clareza
const pages = [
  { name: "Clientes", path: "/clientes" },
];
const settings = [
  { name: "Meu perfil", path: "/perfil/editar" },
  { name: "Logout", path: "#" }, // O path '#' indica que é uma ação
];

function ResponsiveAppBar() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  // NOVO: Inicializar o router para o redirecionamento
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // NOVO: Função para lidar especificamente com o logout
  const handleLogout = async () => {
    handleCloseUserMenu(); // Fecha o menu
    try {
      await signOut(auth); // Termina a sessão no Firebase
      router.push("/"); // Redireciona para a página inicial
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <WhatshotIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/home"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            BRASEAR
          </Typography>

          {/* --- Menu Mobile (apenas para utilizadores autenticados) --- */}
          {user && (
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.name}
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href={page.path}
                  >
                    <Typography textAlign="center">{page.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          {/* --- Logo Mobile --- */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            href="/home"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            BRASEAR
          </Typography>

          {/* --- Menu Desktop (apenas para utilizadores autenticados) --- */}
          {user && (
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  component={Link}
                  href={page.path}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>
          )}

          {/* --- Menu do Utilizador ou Botão de Login --- */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <Tooltip title="Abrir configurações">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user.displayName || ""}
                      src={user.photoURL || ""}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    // MODIFICADO: A lógica de clique agora é diferente para o Logout
                    <MenuItem
                      key={setting.name}
                      onClick={
                        setting.name === "Logout"
                          ? handleLogout
                          : handleCloseUserMenu
                      }
                      component={setting.name !== "Logout" ? Link : "li"}
                      href={setting.path}
                    >
                      <Typography textAlign="center">{setting.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              // Se não houver utilizador, mostra o botão de Login
              <Button
                component={Link}
                href="/login"
                color="inherit"
                variant="outlined"
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
