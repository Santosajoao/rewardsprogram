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
  CircularProgress // Para indicar o loading
} from "@mui/material";
import ResponsiveAppBar from "../../components/AppBar"; // Reutilizando seu AppBar
import { formatarCPF } from "../../lib/utils"; 
// --- Imports do Firebase ---
import { db } from "../../lib/firebase"; // Nosso cliente DB
import { collection, query, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";

// Definindo a "forma" dos dados do nosso cliente
interface Cliente {
  id: string; // Este será o ID do Documento (o CPF não formatado)
  nome: string;
  ultimoCpfUtilizado: string; // O CPF formatado que salvamos
  pontos: number;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Este useEffect vai rodar UMA VEZ quando o componente carregar
  // e vai ficar "escutando" mudanças na coleção 'clientes'
  useEffect(() => {
    // 1. Cria uma query para a coleção "clientes"
    const q = query(collection(db, "clientes"));

    // 2. onSnapshot "escuta" em tempo real. 
    // Ele roda uma vez no começo, e depois roda de novo CADA VEZ que os dados mudarem no Firestore.
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot) => {
      const clientesData: Cliente[] = [];
      
      // 3. Itera sobre cada documento retornado
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        
        // 4. Adiciona à nossa lista de estado, tratando campos que podem não existir
        clientesData.push({
          id: doc.id, // O ID do documento (CPF limpo)
          nome: data.nome || "Nome não cadastrado", // Fallback caso o nome não exista
          ultimoCpfUtilizado: formatarCPF(data.cpf) || "CPF não disponível", // Fallback
          pontos: data.pontos || 0
        });
      });

      // 5. Ordena por pontos (opcional)
      clientesData.sort((a, b) => b.pontos - a.pontos); 
      
      setClientes(clientesData);
      setIsLoading(false);
    });

    // 6. Função de limpeza: Para de "escutar" quando o componente for desmontado
    // Isso evita vazamentos de memória.
    return () => unsubscribe();

  }, []); // O array vazio [] garante que isso só rode no "mount" e "unmount"

  return (
    <>
      <ResponsiveAppBar />
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Ranking de Clientes 🏆
          </Typography>

          {isLoading ? (
            <CircularProgress />
          ) : (
            <Paper sx={{ width: '100%' }}>
              <TableContainer>
                <Table stickyHeader aria-label="tabela de clientes">
                  
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{fontWeight: 'bold'}}>Nome</TableCell>
                      <TableCell sx={{fontWeight: 'bold'}}>CPF (Formatado)</TableCell>
                      <TableCell align="right" sx={{fontWeight: 'bold'}}>Pontos</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow
                        key={cliente.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {cliente.nome}
                        </TableCell>
                        <TableCell>{cliente.ultimoCpfUtilizado}</TableCell>
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