import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { PaginatedResult, PaginationParams } from "./profile.repository.js";

export class PartyRepository {
  async findAll(params: PaginationParams = {}): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.party.findMany({
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.party.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    return prisma.party.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return prisma.party.findUnique({
      where: { name },
    });
  }

  async create(data: Prisma.PartyCreateInput) {
    return prisma.party.create({ data });
  }

  async update(id: number, data: Prisma.PartyUpdateInput) {
    return prisma.party.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.party.delete({
      where: { id },
    });
  }
}

export const partyRepository = new PartyRepository();
