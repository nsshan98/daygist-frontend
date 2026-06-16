"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import { Spinner } from "@/components/atoms/spinner";
import { Wallet, Send, ArrowDownToLine } from "lucide-react";
import {
  ownTransferSchema,
  OwnTransferSchemaType,
  otherTransferSchema,
  OtherTransferSchemaType,
  withdrawSchema,
  WithdrawSchemaType,
} from "@/schema/monetization-schema";
import { useManageTransaction } from "../hooks/monetization-query";

const parseAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
  const v = e.target.valueAsNumber;
  return Number.isNaN(v) ? undefined : v;
};

interface TransactionTabsProps {
  availableBalance: number;
}

export function TransactionTabs({ availableBalance }: TransactionTabsProps) {
  const { manageTransactionMutation } = useManageTransaction();

  const ownForm = useForm<OwnTransferSchemaType>({
    resolver: zodResolver(ownTransferSchema),
    defaultValues: { amount: undefined },
  });

  const otherForm = useForm<OtherTransferSchemaType>({
    resolver: zodResolver(otherTransferSchema),
    defaultValues: { amount: undefined, targetUserId: "", reference: "" },
  });

  const withdrawForm = useForm<WithdrawSchemaType>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: undefined, method: undefined, accountNumber: "" },
  });

  const isPending = manageTransactionMutation.isPending;

  const onOwnSubmit = (values: OwnTransferSchemaType) => {
    manageTransactionMutation.mutate(
      { type: "own", amount: values.amount },
      { onSuccess: () => ownForm.reset() }
    );
  };

  const onOtherSubmit = (values: OtherTransferSchemaType) => {
    manageTransactionMutation.mutate(
      {
        type: "other",
        amount: values.amount,
        targetUserId: values.targetUserId,
        reference: values.reference || undefined,
      },
      { onSuccess: () => otherForm.reset() }
    );
  };

  const onWithdrawSubmit = (values: WithdrawSchemaType) => {
    manageTransactionMutation.mutate(
      {
        type: "withdraw",
        amount: values.amount,
        method: values.method,
        accountNumber: values.accountNumber,
      },
      { onSuccess: () => withdrawForm.reset() }
    );
  };

  return (
    <Tabs defaultValue="own">
      <TabsList className="w-full">
        <TabsTrigger value="own" className="flex items-center gap-1.5">
          <Wallet className="h-4 w-4" />
          Own Wallet
        </TabsTrigger>
        <TabsTrigger value="other" className="flex items-center gap-1.5">
          <Send className="h-4 w-4" />
          Transfer
        </TabsTrigger>
        <TabsTrigger value="withdraw" className="flex items-center gap-1.5">
          <ArrowDownToLine className="h-4 w-4" />
          Withdraw
        </TabsTrigger>
      </TabsList>

      {/* Own Wallet Tab */}
      <TabsContent value="own">
        <Card>
          <CardHeader>
            <CardTitle>Add to Own Wallet</CardTitle>
            <CardDescription>
              Transfer balance to your own wallet. Available:{" "}
              <span className="font-semibold">${availableBalance.toFixed(2)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...ownForm}>
              <form onSubmit={ownForm.handleSubmit(onOwnSubmit)} className="space-y-4">
                <FormField
                  control={ownForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) => field.onChange(parseAmount(e))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? <Spinner /> : <Wallet className="h-4 w-4 mr-2" />}
                  Add to Wallet
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Transfer to Other Tab */}
      <TabsContent value="other">
        <Card>
          <CardHeader>
            <CardTitle>Transfer to Another User</CardTitle>
            <CardDescription>
              Send balance to another user's wallet. Available:{" "}
              <span className="font-semibold">${availableBalance.toFixed(2)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...otherForm}>
              <form onSubmit={otherForm.handleSubmit(onOtherSubmit)} className="space-y-4">
                <FormField
                  control={otherForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) => field.onChange(parseAmount(e))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={otherForm.control}
                  name="targetUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target User</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter user ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={otherForm.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Payment for..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? <Spinner /> : <Send className="h-4 w-4 mr-2" />}
                  Transfer
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Withdraw Tab */}
      <TabsContent value="withdraw">
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Earnings</CardTitle>
            <CardDescription>
              Request a withdrawal to your mobile banking or bank account. Available:{" "}
              <span className="font-semibold">${availableBalance.toFixed(2)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...withdrawForm}>
              <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
                <FormField
                  control={withdrawForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) => field.onChange(parseAmount(e))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={withdrawForm.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bkash">bKash</SelectItem>
                          <SelectItem value="nagad">Nagad</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={withdrawForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? <Spinner /> : <ArrowDownToLine className="h-4 w-4 mr-2" />}
                  Request Withdrawal
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
