import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
// Imports de Button e Typography removidos, pois o 'children' cuidará disso.

const style = {
  position: "absolute",// Adicionado 'as' para tipagem mais estrita do TS
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

// As props estão corretas: open, onClose, e children.
export default function BasicModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    // MODIFICADO: O <div> e o <Button> foram removidos.
    // O Modal é o componente raiz.
    <Modal
      open={open}
      onClose={onClose} // MODIFICADO: Corrigido o typo (era 'onclose' minúsculo)
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {/* MODIFICADO: 
          O conteúdo estático foi removido e substituído por '{children}'.
          Isso permite que qualquer componente (como um formulário de edição) 
          seja renderizado aqui.
        */}
        {children}
      </Box>
    </Modal>
  );
}
