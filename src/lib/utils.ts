// Caminho: lib/utils.ts

// Esta é a função de validação de CPF que você já tem, 
// apenas garantindo que ela esteja em um arquivo .ts com a exportação correta.

export function validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/[^\d]+/g, '');
  
    if (cpfLimpo.length !== 11) {
      return false;
    }
  
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return false;
    }

    let soma = 0;
    let multiplicador = 10;
    
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * multiplicador--;
    }
    
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
  
    if (resto !== parseInt(cpfLimpo.charAt(9))) {
      return false;
    }

    soma = 0;
    multiplicador = 11;
    
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * multiplicador--;
    }
  
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
  
    if (resto !== parseInt(cpfLimpo.charAt(10))) {
      return false;
    }
  
    return true;
  }


// NOVA FUNÇÃO DE FORMATAÇÃO:
// Recebe "12345678900" e retorna "123.456.789-00"
export function formatarCPF(cpfLimpo: string): string {
  if (typeof cpfLimpo !== 'string' || cpfLimpo.length !== 11 || !/^\d+$/.test(cpfLimpo)) {
     // Se não for uma string de 11 dígitos, retorne o original (ou uma msg de erro)
     return cpfLimpo; 
  }

  // Aplica a máscara de formatação usando Regex
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}