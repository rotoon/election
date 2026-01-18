"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublicConstituencies } from "@/hooks/use-dashboard";
import api from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z
  .object({
    email: z.string().email("อีเมลไม่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "กรุณาระบุชื่อ-นามสกุล"),
    nationalId: z
      .string()
      .length(13, "เลขบัตรประชาชนต้องมี 13 หลัก")
      .regex(/^\d+$/, "ต้องเป็นตัวเลขเท่านั้น"),
    address: z.string().min(5, "กรุณาระบุที่อยู่"),
    province: z.string().min(1, "กรุณาเลือกจังหวัด"),
    constituencyId: z.string().min(1, "กรุณาเลือกเขตเลือกตั้ง"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const { data: constituencies = [] } = usePublicConstituencies();
  const provinces = Array.from(new Set(constituencies.map((c) => c.province)));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      nationalId: "",
      address: "",
      province: "",
      constituencyId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await api.post("/auth/register", {
        ...values,
        constituencyId: parseInt(values.constituencyId),
      });

      toast.success("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
      window.location.reload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "การลงทะเบียนล้มเหลว");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อีเมล</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>รหัสผ่าน</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อ - นามสกุล</FormLabel>
              <FormControl>
                <Input placeholder="สมชาย ใจดี" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nationalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เลขบัตรประจำตัวประชาชน</FormLabel>
              <FormControl>
                <Input placeholder="1234567890123" maxLength={13} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ที่อยู่</FormLabel>
              <FormControl>
                <Input placeholder="บ้านเลขที่, ถนน..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จังหวัด</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedProvince(value);
                    form.setValue("constituencyId", ""); // Reset constituency
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกจังหวัด" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="constituencyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เขตเลือกตั้ง</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedProvince}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเขต" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {constituencies
                      .filter((c) => c.province === selectedProvince)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
        </Button>
      </form>
    </Form>
  );
}
