// Caminho: components/CpfMaskAdapter.tsx
import React, { forwardRef } from "react";
import { IMaskInput } from "react-imask";

// Esta interface define as props que o MUI vai passar para o 'inputComponent'
// e que nós precisamos repassar para o IMaskInput.
interface CustomMaskProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

// Usamos forwardRef para que o MUI possa passar uma 'ref' para o input interno
export const CpfMaskAdapter = forwardRef<HTMLInputElement, CustomMaskProps>(
  function CpfMaskAdapter(props, ref) {
    const { onChange, ...other } = props;

    return (
      <IMaskInput
        {...other} // Passa outras props (como 'id', 'placeholder', 'className', etc.)
        mask="000.000.000-00"
        inputRef={ref} // Conecta a ref do MUI ao input real do IMask
        
        // O IMask dispara 'onAccept' (quando o valor muda E bate com a máscara)
        // Nós "traduzimos" isso de volta para um evento 'onChange' padrão do React
        onAccept={(value: any) => 
          onChange({ target: { name: props.name, value } })
        }
        overwrite // Garante que a máscara substitua o texto ao digitar
      />
    );
  },
);

export default CpfMaskAdapter;