import emailjs from '@emailjs/browser';

interface ClassificationResult {
  type: "Product" | "Team" | "Other";
}

// Initialize EmailJS
if (typeof window !== 'undefined') {
  emailjs.init(process.env.EMAILJS_PUBLIC_KEY as string);
}

/**
 * Sends a formatted message to a Discord webhook.
 * @param summary The summary of the event.
 * @param type The classified type (e.g., "Product", "Team").
 * @param link A link relevant to the event.
 * @returns A promise that resolves to true on success, false on failure.
 */
async function sendToDiscord(summary: string, type: "Product" | "Team" | "Other", link: string): Promise<boolean> {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL not configured. Skipping Discord notification.');
    return false;
  }

  const formattedSummary = summary.length > 200 ? summary.substring(0, 197) + '...' : summary; // Shorten if too long

  const discordPayload = {
    content: `**${type} Update!**\nSummary: ${formattedSummary}\nLink: <${link}>`,
    embeds: [{
      title: `${type} Update`,
      description: formattedSummary,
      url: link,
      color: type === "Product" ? 3447003 : (type === "Team" ? 16752000 : 8355711) // Blue for Product, Orange for Team, Gray for Other
    }]
  };

  try {
    const discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      const discordErrorText = await discordResponse.text();
      console.error('Failed to send to Discord webhook:', { status: discordResponse.status, error: discordErrorText });
      return false;
    }
    console.log('Successfully sent to Discord webhook.');
    return true;
  } catch (error) {
    console.error('Error sending to Discord webhook:', error);
    return false;
  }
}

export async function classifyAndSend(summary: string, type: "Product" | "Team" | "Other", link: string): Promise<{ success: boolean; message: string }> {
  try {
    // Type is now passed directly, no need to call /api/classify here

    // Based on type:
    if (type === 'Product') {
      // If Product -> send to Discord via webhook
      const sentToDiscord = await sendToDiscord(summary, type, link);
      if (sentToDiscord) {
        return { success: true, message: 'Successfully sent to Discord webhook.' };
      } else {
        return { success: false, message: 'Failed to send to Discord webhook.' };
      }

    } else if (type === 'Team') {
      // If Team -> send via EmailJS
      console.log(`Attempting to send email via EmailJS for Team update: Summary: ${summary}, Link: ${link}`);
      const serviceId = process.env.EMAILJS_SERVICE_ID as string;
      const templateId = process.env.EMAILJS_TEMPLATE_ID as string;
      const publicKey = process.env.EMAILJS_PUBLIC_KEY as string;
      const receiverEmail = process.env.EMAILJS_RECEIVER_EMAIL as string;

      if (!serviceId || !templateId || !publicKey || !receiverEmail) {
        console.error('EmailJS environment variables (SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY, RECEIVER_EMAIL) are not fully set. Cannot send email.');
        return { success: false, message: 'EmailJS configuration incomplete.' };
      }

      try {
        // Only attempt to send email if we're in a browser environment
        if (typeof window !== 'undefined') {
          await emailjs.send(
            serviceId,
            templateId,
            {
              summary: summary,
              link: link,
              to_email: receiverEmail,
              subject: `Team Update: ${summary.substring(0, 50)}...`,
            },
            publicKey
          );
          console.log('Email sent successfully via EmailJS.');
          return { success: true, message: 'Successfully sent email via EmailJS.' };
        } else {
          console.log('Skipping EmailJS send in server-side context');
          return { success: true, message: 'Skipped email send in server context.' };
        }
      } catch (emailjsError) {
        console.error('Error sending email via EmailJS:', emailjsError);
        return { success: false, message: `Failed to send email via EmailJS: ${emailjsError instanceof Error ? emailjsError.message : String(emailjsError)}` };
      }

    } else {
      // If Other -> do nothing
      console.log('Summary classified as Other. No action taken.');
      return { success: true, message: 'Summary classified as Other. No action taken.' };
    }

  } catch (error) {
    console.error('Error in classifyAndSend function:', error);
    return { success: false, message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}