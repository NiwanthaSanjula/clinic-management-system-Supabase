// components/patients/PatientForm.tsx
// Reused for both create and edit
// mode prop controls labels and button text
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState, useTransition } from "react"
import { createPatientSchema, type CreatePatientInput } from "@/lib/validation/patient"
import Link from "next/link"
import { Calendar, Droplet, House, IdCard, Mail, MilkOff, Phone, User, UserPlus } from "lucide-react"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

type Props = {
    mode: "create" | "edit"
    backHref: string
    // Pre-filled values for edit mode — empty for create
    defaultValues?: Partial<CreatePatientInput>
    // The server action to call on submit
    action: (prevState: { error: string } | null, formData: FormData) => Promise<{ error: string } | null>
}

export default function PatientForm({ mode, backHref, defaultValues = {}, action }: Props) {
    const [state, formAction] = useActionState(action, null)
    const [pending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreatePatientInput>({
        resolver: zodResolver(createPatientSchema),
        defaultValues, // pre-fills fields in edit mode
    })

    function onSubmit(data: CreatePatientInput) {
        const formData = new FormData()
        Object.entries(data).forEach(([k, v]) => {
            if (v !== undefined) formData.append(k, v as string)
        })
        startTransition(() => { formAction(formData) })
    }

    const isEdit = mode === "edit"

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <Link href={backHref} className="text-gray-400 hover:text-gray-600 transition-colors">
                    ← Back
                </Link>
                <div className="flex items-center gap-4">
                    <UserPlus size={45} className="text-emerald-500" />
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isEdit ? "Edit Patient" : "Add New Patient"}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isEdit ? "Update patient record." : "Enter patient details to create a new record."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Server error */}
            {state?.error && (
                <p className="text-red-500 bg-red-100 border border-red-200 rounded p-3 text-sm animate-pulse">
                    {state.error}
                </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Basic Info */}
                <div className="bg-white rounded-lg border p-6 space-y-4 border-l-4 border-l-emerald-500">
                    <h2 className="text-emerald-500 font-bold">Basic Information</h2>

                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel><User size={15} className="text-emerald-500" /> Full Name</FieldLabel>
                                <Input {...register("name")} placeholder="Enter patient full name" />
                                {errors.name && <FieldDescription className="text-red-500">{errors.name.message}</FieldDescription>}
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel><IdCard size={15} className="text-emerald-500" /> NIC</FieldLabel>
                                    {/* NIC cannot be changed in edit mode — it's the unique identifier */}
                                    <Input
                                        {...register("nic")}
                                        placeholder="123456789V"
                                        disabled={isEdit}
                                        className={isEdit ? "opacity-50 cursor-not-allowed" : ""}
                                    />
                                    {isEdit && <FieldDescription className="text-gray-400">NIC cannot be changed</FieldDescription>}
                                    {errors.nic && <FieldDescription className="text-red-500">{errors.nic.message}</FieldDescription>}
                                </Field>
                            </FieldGroup>
                        </FieldSet>

                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel><Phone size={15} className="text-emerald-500" /> Phone</FieldLabel>
                                    <Input {...register("phone")} placeholder="07XXXXXXXX" />
                                    {errors.phone && <FieldDescription className="text-red-500">{errors.phone.message}</FieldDescription>}
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </div>

                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel><Mail size={15} className="text-emerald-500" /> Email</FieldLabel>
                                <Input type="email" {...register("email")} placeholder="optional" />
                                {errors.email && <FieldDescription className="text-red-500">{errors.email.message}</FieldDescription>}
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </div>

                {/* Personal Info */}
                <div className="bg-white rounded-lg border p-6 space-y-4 border-l-4 border-l-blue-500">
                    <h2 className="text-blue-500 font-bold">Personal Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel><Calendar size={15} className="text-blue-500" /> Date of Birth</FieldLabel>
                                    <Input type="date" {...register("dateOfBirth")} />
                                </Field>
                            </FieldGroup>
                        </FieldSet>

                        <div>
                            <label className="text-sm font-medium flex items-center gap-2 mb-1">Gender</label>
                            <select
                                {...register("gender")}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>

                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel><House size={15} className="text-blue-500" /> Address</FieldLabel>
                                <Input {...register("address")} placeholder="optional" />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </div>

                {/* Medical Info */}
                <div className="bg-white rounded-lg border p-6 space-y-4 border-l-4 border-l-fuchsia-500">
                    <h2 className="text-fuchsia-500 font-bold">Medical Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                <Droplet size={15} className="text-fuchsia-500" /> Blood Group
                            </label>
                            <select
                                {...register("bloodGroup")}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Unknown</option>
                                {BLOOD_GROUPS.map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>

                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel className="text-red-500">
                                        <MilkOff size={15} /> ⚠ Known Allergies
                                    </FieldLabel>
                                    <Textarea
                                        {...register("knownAllergies")}
                                        rows={3}
                                        placeholder="e.g. Penicillin, Peanuts — leave blank if none"
                                        className="border-red-200 focus:ring-red-400"
                                    />
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={pending}
                    className={`w-full py-5 ${pending ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"}`}
                >
                    {pending ? "Saving..." : isEdit ? "Update Record" : "Create Record"}
                </Button>

            </form>
        </div>
    )
}