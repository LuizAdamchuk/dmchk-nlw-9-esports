import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import { convertHoutStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHoutString } from "./utils/convert-minutes-to-hour-string";

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });
  return res.json(games);
});

app.get("/ads/:id/discord", async (req, res) => {
  const adId = req.params.id;
  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });
  return res.json(ad);
});

app.post("/games/:id/ads", async (req, res) => {
  const body = req.body;
  const gameId = req.params.id;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      weekDays: body.weekDays.join(","),
      useVoiceChannel: body.useVoiceChannel,
      hourStart: convertHoutStringToMinutes(body.hourStart),
      hourEnd: convertHoutStringToMinutes(body.hourEnd),
      discord: body.discord,
    },
  });

  return res.json(ad);
});

app.get("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hourStart: convertMinutesToHoutString(ad.hourStart),
        hourEnd: convertMinutesToHoutString(ad.hourEnd),
      };
    })
  );
});

app.listen(3333);
