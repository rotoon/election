import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const connectionString = `${process.env.DIRECT_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// --- DATA FROM FRONTEND ---

const PROVINCES_DATA = [
  // North
  { name: 'Chiang Mai', zones: 3 },
  // Northeast
  { name: 'Khon Kaen', zones: 3 },
  { name: 'Nakhon Ratchasima', zones: 3 },
  // Central
  { name: 'Bangkok', zones: 5 },
  // East
  { name: 'Chonburi', zones: 3 },
  // West
  { name: 'Kanchanaburi', zones: 2 },
  // South
  { name: 'Songkhla', zones: 3 },
  { name: 'Phuket', zones: 1 },
]

const PARTIES = [
  {
    name: 'Future Forward (FF)',
    color: '#F47933', // Orange
    policy: 'Technology for All',
    logoUrl: 'https://placehold.co/200x200/F47933/ffffff.png?text=FF',
  },
  {
    name: "People's Power (PP)",
    color: '#E30613', // Red
    policy: 'Power to the People',
    logoUrl: 'https://placehold.co/200x200/E30613/ffffff.png?text=PP',
  },
  {
    name: 'Blue Sky (BS)',
    color: '#2D3494', // Blue
    policy: 'Clear Sky, Clear Future',
    logoUrl: 'https://placehold.co/200x200/2D3494/ffffff.png?text=BS',
  },
  {
    name: 'Green Earth (GE)',
    color: '#00B2E3', // Light Blue/Green
    policy: 'Sustainable Growth',
    logoUrl: 'https://placehold.co/200x200/00B2E3/ffffff.png?text=GE',
  },
]

const NAMES = ['Somchai', 'Somsak', 'Malee', 'Wichai', 'Pranee']
const SURNAMES = ['Jaidee', 'Rakthai', 'Mungmee', 'Srisuk']

function randomName() {
  const first = NAMES[Math.floor(Math.random() * NAMES.length)]
  const last = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
  return { first, last }
}

async function main() {
  console.log('🌱 Starting Lightweight Election Data Seed (Fictional)...')

  // 0. Cleanup
  console.log('🧹 Cleaning up old data...')
  try {
    await prisma.vote.deleteMany()
    await prisma.candidate.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.party.deleteMany()
    await prisma.constituency.deleteMany()
  } catch (e) {
    console.log('Cleanup warning:', e)
  }

  // 1. Create Constituencies
  console.log('Creating Constituencies...')
  const constituencyMap = []

  for (const prov of PROVINCES_DATA) {
    for (let i = 1; i <= prov.zones; i++) {
      // 80% Closed
      const isPollOpen = Math.random() > 0.8

      const c = await prisma.constituency.create({
        data: {
          province: prov.name,
          zoneNumber: i,
          isPollOpen: isPollOpen,
        },
      })
      constituencyMap.push(c)
      process.stdout.write('.')
    }
  }
  console.log(`\n✅ Created ${constituencyMap.length} constituencies`)

  // 2. Create Parties
  console.log('Creating Parties...')
  const partyMap = []
  for (const p of PARTIES) {
    const party = await prisma.party.create({
      data: {
        name: p.name,
        color: p.color,
        policy: p.policy,
        logoUrl: p.logoUrl,
      },
    })
    partyMap.push(party)
  }
  console.log(`✅ Created ${partyMap.length} parties`)

  // 3. Create Candidates & Profiles & Votes
  console.log('Creating Candidates and Voters...')

  const hashedPassword = await bcrypt.hash('123456', 12)
  let totalVotes = 0
  let globalCounter = 0

  for (const cons of constituencyMap) {
    // 3.1 Create Candidates
    const numCandidates = 3
    const shuffledParties = [...partyMap].sort(() => 0.5 - Math.random())
    const selectedParties = shuffledParties.slice(0, numCandidates)

    const candidatesInCons = []

    for (let i = 0; i < selectedParties.length; i++) {
      const party = selectedParties[i]
      const { first, last } = randomName()
      const candidate = await prisma.candidate.create({
        data: {
          firstName: first,
          lastName: last,
          candidateNumber: i + 1,
          partyId: party.id,
          constituencyId: cons.id,
          imageUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${first}${last}`,
          personalPolicy: `Vote for ${party.name}`,
          nationalId: (9000000000000 + globalCounter++).toString(),
        },
      })
      candidatesInCons.push(candidate)
    }

    // 3.2 Create Voters & Votes (Lightweight)
    if (!cons.isPollOpen) {
      const voteCount = 30 // Only 30 votes per constituency for speed
      const winnerIndex = Math.floor(Math.random() * candidatesInCons.length)

      const votersData = Array.from({ length: voteCount }).map((_, idx) => {
        globalCounter++
        return {
          email: `v_${cons.id}_${idx}@seed.com`,
          password: hashedPassword,
          nationalId: (1000000000000 + globalCounter).toString(),
          fullName: `Voter ${idx}`,
          address: `${cons.province}`,
          role: Role.voter,
          constituencyId: cons.id,
          createdAt: new Date(),
        }
      })

      // Create users one by one to ensure we get IDs safely/easily without complex logic
      for (const userData of votersData) {
        const user = await prisma.profile.create({ data: userData })

        let candidateIndex = Math.floor(Math.random() * candidatesInCons.length)
        if (Math.random() > 0.4) candidateIndex = winnerIndex // 60% bias

        await prisma.vote.create({
          data: {
            userId: user.id,
            constituencyId: cons.id,
            candidateId: candidatesInCons[candidateIndex].id,
          },
        })
      }
      totalVotes += voteCount
    }
    process.stdout.write('.')
  }

  console.log(`\n✅ Simulated ${totalVotes} votes`)

  // 4. Create Fixed Users
  await prisma.profile.create({
    data: {
      email: 'admin@election.th',
      password: hashedPassword,
      nationalId: '1111111',
      fullName: 'Admin',
      role: Role.admin,
      address: 'Admin HQ',
    },
  })

  await prisma.profile.create({
    data: {
      email: 'ec@election.th',
      password: hashedPassword,
      nationalId: '2222222',
      fullName: 'EC Chair',
      role: Role.ec,
      address: 'EC HQ',
    },
  })

  await prisma.profile.create({
    data: {
      email: 'voter@election.th',
      password: hashedPassword,
      nationalId: '3333333',
      fullName: 'Voter 1',
      role: Role.voter,
      address: 'Bangkok',
      constituencyId: constituencyMap[0].id,
    },
  })

  console.log('🏁 Seeding finished!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
