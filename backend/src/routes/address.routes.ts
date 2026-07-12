import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { addressRepository } from "../repositories/address.repository";
import { userRepository } from "../repositories/user.repository";
import { requireAuth } from "../middlewares/auth.middleware";

const addressSchema = z.object({
  recipientName: z.string().min(3, "Nama penerima minimal 3 karakter"),
  phoneNumber: z.string().min(9, "Nomor telepon tidak valid"),
  fullAddress: z.string().min(10, "Alamat terlalu singkat"),
  addressNote: z.string().optional(),
  city: z.string().min(1, "Kota wajib diisi"),
  postalCode: z.string().min(5, "Kode pos tidak valid"),
  isDefault: z.boolean().optional(),
});

async function resolveUserId(authId: string) {
  const user = await userRepository.findOrCreateByAuthId(authId);
  return user.id as string;
}

function toDTO(row: Record<string, unknown>) {
  return {
    id: row.id,
    recipientName: row.recipient_name,
    phoneNumber: row.phone_number,
    fullAddress: row.full_address,
    addressNote: row.address_note,
    city: row.city,
    postalCode: row.postal_code,
    isDefault: row.is_default,
  };
}

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await resolveUserId(req.user!.authId);
    const addresses = await addressRepository.listByUserId(userId);
    res.json({ success: true, data: addresses.map(toDTO) });
  } catch (err) { next(err); }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await resolveUserId(req.user!.authId);
    const payload = addressSchema.parse(req.body);
    const address = await addressRepository.create(userId, payload);
    res.status(201).json({ success: true, message: "Alamat berhasil disimpan", data: toDTO(address) });
  } catch (err) { next(err); }
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await resolveUserId(req.user!.authId);
    const payload = addressSchema.partial().parse(req.body);
    const address = await addressRepository.update(userId, req.params.id, payload);
    res.json({ success: true, message: "Alamat berhasil diperbarui", data: toDTO(address) });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await resolveUserId(req.user!.authId);
    await addressRepository.remove(userId, req.params.id);
    res.json({ success: true, message: "Alamat berhasil dihapus" });
  } catch (err) { next(err); }
});

router.patch("/:id/set-default", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await resolveUserId(req.user!.authId);
    await addressRepository.setDefault(userId, req.params.id);
    res.json({ success: true, message: "Alamat utama berhasil diubah" });
  } catch (err) { next(err); }
});

export default router;
