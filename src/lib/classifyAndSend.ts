interface ClassificationResult {
  type: "Product" | "Team" | "Other";
}

export async function classifyAndSend(summary: string, link: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Call /api/classify to get the type
    const classifyResponse = await fetch('http://localhost:3000/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary }),
    });

    if (!classifyResponse.ok) {
      const errorText = await classifyResponse.text();
      console.error('Failed to classify summary:', { status: classifyResponse.status, error: errorText });
      return { success: false, message: `Classification failed: ${classifyResponse.status} - ${errorText}` };
    }

    const { type }: ClassificationResult = await classifyResponse.json();
    console.log(`Classified summary as: ${type}`);

    // 2. Based on type:
    if (type === 'Product') {
      // If Product -> send to Discord via webhook
      const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (!discordWebhookUrl) {
        console.warn('DISCORD_WEBHOOK_URL not configured. Skipping Discord notification.');
        return { success: false, message: 'Discord webhook URL not configured.' };
      }

      const discordPayload = {
        content: `New Product Update! \nSummary: ${summary}\nLink: ${link}`,
        embeds: [{
          title: "New Product Update",
          description: summary,
          url: link,
          color: 3447003 // Blue color for Discord embeds
        }]
      };

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
        return { success: false, message: `Failed to send to Discord: ${discordResponse.status} - ${discordErrorText}` };
      }
      console.log('Successfully sent to Discord webhook.');
      return { success: true, message: 'Successfully sent to Discord webhook.' };

    } else if (type === 'Team') {
      // If Team -> send via Gmail API (or log for now)
      console.log(`Team related update: Summary: ${summary}, Link: ${link}`);
      console.log('Gmail API integration is not implemented. Logging instead.');
      return { success: true, message: 'Team update logged. Gmail API not implemented.' };

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