interface SendSupportEmailParams {
  from: string;
  subject: string;
  message: string;
  name: string;
}

export async function sendSupportEmail({
  from,
  subject,
  message,
  name,
}: SendSupportEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Usando FormSubmit como alternativa temporária
    // Substitua 'SEU_EMAIL' pelo email onde quer receber as mensagens
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', from);
    formData.append('subject', `[Suporte Gestão Piscinas] ${subject}`);
    formData.append('message', message);
    formData.append('_template', 'box'); // Template bonito
    formData.append('_captcha', 'false'); // Desabilitar captcha

    const response = await fetch('https://formsubmit.co/ajax/meusalao.suporte@gmail.com', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return {
        success: false,
        error: data.message || "Erro ao enviar email.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return {
      success: false,
      error: "Erro de conexão. Verifique sua internet e tente novamente.",
    };
  }
}

// Alternativa comentada: Implementação com backend próprio
// Para usar Resend corretamente, você precisaria de um backend:
/*
export async function sendSupportEmailWithBackend({
  from,
  subject,
  message,
  name,
}: SendSupportEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Chama seu backend que tem a API Key do Resend
    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        subject,
        message,
        name,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Erro ao enviar email.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente mais tarde.",
    };
  }
}
*/ 