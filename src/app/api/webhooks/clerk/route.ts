import { prisma } from "@/lib/prisma";
import type { UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let evt: WebhookEvent;

  // 1. Verificar a assinatura do webhook.
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!signingSecret) {
      console.error("CLERK_WEBHOOK_SECRET não configurado.");

      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    evt = await verifyWebhook(req, {
      signingSecret,
    });

    console.log("Webhook verificado:", evt.type);
  } catch (error) {
    console.error("Falha ao verificar webhook:", error);

    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 },
    );
  }

  // 2. Processar o evento validado.
  try {
    const eventType = evt.type;
    const clerkUserId = evt.data.id;

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "No user ID provided" },
        { status: 400 },
      );
    }

    switch (eventType) {
      case "user.created": {
        const data = evt.data as UserJSON;

        const primaryEmailId = data.primary_email_address_id;

        const email =
          data.email_addresses.find((address) => address.id === primaryEmailId)
            ?.email_address ?? data.email_addresses[0]?.email_address;

        if (!email) {
          return NextResponse.json(
            { error: "User email not found" },
            { status: 400 },
          );
        }

        const firstName = data.first_name ?? email.split("@")[0];

        // Primeiro, procura pelo ID do Clerk.
        const existingByClerkId = await prisma.user.findUnique({
          where: { clerkUserId },
        });

        let user;

        if (existingByClerkId) {
          // O usuário já está vinculado ao Clerk.
          user = await prisma.user.update({
            where: { clerkUserId },
            data: {
              email,
              firstName,
              lastName: data.last_name,
              imageUrl: data.image_url,
            },
          });
        } else {
          // Verifica se o e-mail já existe no banco.
          const existingByEmail = await prisma.user.findUnique({
            where: { email },
          });

          if (existingByEmail) {
            // Não vincula automaticamente um ID externo diferente.
            // É necessário confirmar que a conta pertence à mesma pessoa.
            return NextResponse.json(
              {
                error: "Email already associated with another user",
                eventType,
              },
              { status: 409 },
            );
          }

          user = await prisma.user.create({
            data: {
              clerkUserId,
              email,
              firstName,
              lastName: data.last_name,
              imageUrl: data.image_url,
            },
          });
        }

        console.log("Usuário sincronizado:", clerkUserId);

        return NextResponse.json({
          received: true,
          eventType,
          user,
        });
      }

      case "user.updated": {
        const data = evt.data as UserJSON;

        const primaryEmailId = data.primary_email_address_id;

        const email =
          data.email_addresses.find((address) => address.id === primaryEmailId)
            ?.email_address ?? data.email_addresses[0]?.email_address;

        if (!email) {
          return NextResponse.json(
            { error: "User email not found" },
            { status: 400 },
          );
        }

        const user = await prisma.user.update({
          where: {
            clerkUserId,
          },
          data: {
            email,
            firstName: data.first_name ?? email.split("@")[0],
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
        });

        console.log("Usuário atualizado:", clerkUserId);

        return NextResponse.json({
          received: true,
          eventType,
          user,
        });
      }

      case "user.deleted": {
        const result = await prisma.user.deleteMany({
          where: {
            clerkUserId,
          },
        });

        console.log("Usuário removido:", clerkUserId);

        return NextResponse.json({
          received: true,
          eventType,
          deletedCount: result.count,
        });
      }

      default: {
        // Outros eventos são aceitos, sem processamento adicional.
        console.log("Evento ignorado:", eventType);

        return NextResponse.json({
          received: true,
          ignored: true,
          eventType,
        });
      }
    }
  } catch (error) {
    console.error("Erro ao processar evento no Prisma:", error);

    return NextResponse.json(
      { error: "Failed to process webhook event" },
      { status: 500 },
    );
  }
}
