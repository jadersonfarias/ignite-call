import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)
  const { date } = req.query

  // COMO VAI FICAR A URL = http://localhost:3333/api/users/jader/avalability?date=2024-09-17

  if (!date) {
    return res.status(400).json({ message: 'Date not provider.' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }
  const referenceDate = dayjs(String(date)) // hora atual

  const isPastDate = referenceDate.endOf('day').isBefore(new Date())

  if (isPastDate) {
    return res.json({ possibleTimes: [], availability: [] })
  }

  const userAvalability = await prisma.userTimeInterval.findFirst({
    // faz uma busca com base no id do usuario e com a referencia do dia
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  })

  if (!userAvalability) {
    return res.json({ possibleTimes: [], availability: [] })
  }

  // eslint-disable-next-line camelcase
  const { time_end_in_minutes, time_start_in_minutes } = userAvalability

  // eslint-disable-next-line camelcase
  const startHour = time_start_in_minutes / 60
  // eslint-disable-next-line camelcase
  const endHour = time_end_in_minutes / 60

  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, i) => {
      return startHour + i
    },
  )

  const blockedTimes = await prisma.scheduling.findMany({
    // findMany recupera varios registros juntos
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        gte: referenceDate.set('hour', startHour).toDate(), // se for maior o igual hora atual
        lte: referenceDate.set('hour', endHour).toDate(), // se for menor ou igual a hora atual
      },
    },
  })

  const availableTimes = possibleTimes.filter((time) => {
    const isTimeBlocked = blockedTimes.some(
      (blockedTimes) => blockedTimes.date.getHours() === time,
    )

    const isTimeInPast = referenceDate.set('hour', time).isBefore(new Date())

    return !isTimeBlocked && !isTimeInPast
  })

  return res.json({ possibleTimes, availableTimes })
}
