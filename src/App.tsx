import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PASSWORD = "note2024";

type RiskLevel = "safe" | "warn" | "danger";
type LoanType = "single" | "pair";

function calcMonthlyPayment(
  principalMan: number,
  annualRate: number,
  years: number
): number {
  if (annualRate === 0) return (principalMan * 10000) / (years * 12);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return (
    ((principalMan * 10000) * r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1)
  );
}

function formatAmount(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}億円`;
  return `${v}万円`;
}

function getRiskLevel(ratio: number, children: number): RiskLevel {
  const safeThresholds = [25, 23, 21, 20];
  const warnThresholds = [30, 28, 26, 25];
  
  const childIndex = Math.min(children, 3);
  const safeRatio = safeThresholds[childIndex];
  const warnRatio = warnThresholds[childIndex];
  
  if (ratio <= safeRatio) return "safe";
  if (ratio <= warnRatio) return "warn";
  return "danger";
}

function getSafeRatio(children: number): number {
  if (children === 0) return 25;
  if (children === 1) return 23;
  if (children === 2) return 21;
  return 20;
}

// ── Sub-components ──────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  if (level === "safe")
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
        安全
      </Badge>
    );
  if (level === "warn")
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        注意
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">危険</Badge>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: SliderFieldProps) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-base font-bold text-gray-900">
          {format(value)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]: number[]) => onChange(v)}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ── Free Simulator ───────────────────────────────────────────────

function FreeSimulator() {
  const [income, setIncome] = useState<number>(700);
  const [loan, setLoan] = useState<number>(5000);
  const [rate, setRate] = useState<number>(0.5);
  const [years, setYears] = useState<number>(35);

  const monthlyMan = calcMonthlyPayment(loan, rate, years) / 10000;
  const ratio = (monthlyMan * 12 / income) * 100;
  const diff1 =
    (calcMonthlyPayment(loan, rate + 1, years) -
      calcMonthlyPayment(loan, rate, years)) /
    10000;
  const riskLevel = getRiskLevel(ratio, 0);

  return (
    <div>
      <div className="bg-blue-50 rounded-xl p-5 mb-6">
        <SliderField
          label="年収"
          value={income}
          min={0}
          max={2000}
          step={50}
          onChange={setIncome}
          format={(v) => `${v}万円`}
        />
        <SliderField
          label="借入希望額"
          value={loan}
          min={1000}
          max={15000}
          step={100}
          onChange={setLoan}
          format={formatAmount}
        />
        <SliderField
          label="金利（年）"
          value={rate}
          min={0.1}
          max={5.0}
          step={0.1}
          onChange={setRate}
          format={(v) => `${v.toFixed(1)}%`}
        />
        <SliderField
          label="返済期間"
          value={years}
          min={10}
          max={50}
          step={5}
          onChange={setYears}
          format={(v) => `${v}年`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500 mb-1">月額返済額</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {monthlyMan.toFixed(1)}万円
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500 mb-1">返済比率</p>
            <p
              className={cn(
                "text-2xl font-extrabold",
                riskLevel === "safe"
                  ? "text-emerald-600"
                  : riskLevel === "warn"
                  ? "text-yellow-600"
                  : "text-red-600"
              )}
            >
              {ratio.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert
        className={cn(
          "mb-4",
          riskLevel === "safe"
            ? "bg-emerald-50 border-emerald-200"
            : riskLevel === "warn"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-red-50 border-red-200"
        )}
      >
        <AlertDescription className="flex items-center gap-3">
          <RiskBadge level={riskLevel} />
          <span className="text-sm text-gray-700">
            {riskLevel === "safe"
              ? "返済比率が適切な範囲内です。"
              : riskLevel === "warn"
              ? "やや高めです。生活費の変化に注意してください。"
              : "返済比率が高すぎます。借入額を減らすことを強く推奨します。"}
          </span>
        </AlertDescription>
      </Alert>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription>
          <p className="text-sm font-bold text-amber-900 mb-1">
            ⚠️ 金利1%上昇した場合
          </p>
          <p className="text-sm text-amber-800">
            月額返済額が <strong>{diff1.toFixed(1)}万円</strong> 増加（年間{" "}
            <strong>{(diff1 * 12).toFixed(1)}万円</strong> の負担増）
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ── Paid Simulator ───────────────────────────────────────────────

function PaidSimulator() {
  const [income1, setIncome1] = useState<number>(700);
  const [income2, setIncome2] = useState<number>(500);
  const [loanType, setLoanType] = useState<LoanType>("pair");
  const [loan, setLoan] = useState<number>(6000);
  const [rate, setRate] = useState<number>(0.5);
  const [years, setYears] = useState<number>(35);
  const [children, setChildren] = useState<number>(0);
  const [otherLoan, setOtherLoan] = useState<number>(0);

  const isPair = loanType === "pair";
  const safeRatio = getSafeRatio(children);

  const totalIncome = isPair ? income1 + income2 : income1;
  const mainIncome = Math.max(income1, income2);
  const monthlyMan = calcMonthlyPayment(loan, rate, years) / 10000;
  const monthlyTotal = monthlyMan + otherLoan;
  const annualRepay = monthlyTotal * 12;

  const ratioTotal = (annualRepay / totalIncome) * 100;
  const ratioMain = (annualRepay / mainIncome) * 100;

  const scenarios = [0, 1, 2, 3].map((i) => ({
    label: i === 0 ? "現在" : `+${i}%`,
    rate: rate + i,
    monthly: calcMonthlyPayment(loan, rate + i, years) / 10000 + otherLoan,
  }));

  const overallLevel = getRiskLevel(ratioMain, children);

  const childrenLabel = children === 3 ? "3人以上" : `${children}人`;

  const diagnosisText = (): string => {
    if (overallLevel === "danger") {
      return isPair
        ? `片方の収入が止まった場合、返済が困難になるリスクが高いです。子供${childrenLabel}の場合、推奨返済比率は${safeRatio}%以下です。借入額を減らすか再検討してください。`
        : `返済比率が高すぎます。子供${childrenLabel}の場合、推奨は${safeRatio}%以下です。借入額を減らすことを強く推奨します。`;
    }
    if (overallLevel === "warn") {
      return isPair
        ? `世帯収入ベースでは問題ありませんが、片方の収入が止まると厳しくなります。子供${childrenLabel}の場合、推奨返済比率は${safeRatio}%以下です。緊急資金の確保を忘れずに。`
        : `やや高めです。子供${childrenLabel}の場合、推奨返済比率は${safeRatio}%以下です。教育費の増加も見越して余裕を持たせてください。`;
    }
    return `現時点では推奨範囲内（${safeRatio}%以下）です。ただし変動金利の場合、金利上昇シナリオも必ず確認してください。`;
  };

  return (
    <div>
      <div className="bg-blue-50 rounded-xl p-5 mb-6">
        {/* Loan type */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            ローンの種類
          </p>
          <div className="flex gap-3">
            {(["single", "pair"] as LoanType[]).map((type) => (
              <button
                key={type}
                onClick={() => setLoanType(type)}
                className={cn(
                  "flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-colors",
                  loanType === type
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-gray-200 bg-white text-gray-700"
                )}
              >
                {type === "pair" ? "ペアローン" : "単独ローン"}
              </button>
            ))}
          </div>
        </div>

        {/* Children */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">子供の数</p>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setChildren(n)}
                className={cn(
                  "flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-colors",
                  children === n
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-gray-200 bg-white text-gray-700"
                )}
              >
                {n === 3 ? "3人〜" : `${n}人`}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2">
            推奨返済比率：<strong>{safeRatio}%以下</strong>（子供
            {childrenLabel}の場合）
          </p>
        </div>

        <SliderField
          label={isPair ? "あなたの年収" : "年収"}
          value={income1}
          min={0}
          max={2000}
          step={50}
          onChange={setIncome1}
          format={(v) => `${v}万円`}
        />
        {isPair && (
          <SliderField
            label="配偶者の年収"
            value={income2}
            min={0}
            max={2000}
            step={50}
            onChange={setIncome2}
            format={(v) => `${v}万円`}
          />
        )}
        <SliderField
          label="借入希望額"
          value={loan}
          min={1000}
          max={15000}
          step={100}
          onChange={setLoan}
          format={formatAmount}
        />
        <SliderField
          label="金利（年）"
          value={rate}
          min={0.1}
          max={5.0}
          step={0.1}
          onChange={setRate}
          format={(v) => `${v.toFixed(1)}%`}
        />
        <SliderField
          label="返済期間"
          value={years}
          min={10}
          max={50}
          step={5}
          onChange={setYears}
          format={(v) => `${v}年`}
        />
        <SliderField
          label="他のローン月額"
          value={otherLoan}
          min={0}
          max={50}
          step={1}
          onChange={setOtherLoan}
          format={(v) => `${v}万円`}
        />
      </div>

      {/* Ratio comparison */}
      <div className="mb-4">
        <p className="text-sm font-bold text-gray-700 mb-3">返済比率の比較</p>
        <div
          className={cn("grid gap-3", isPair ? "grid-cols-2" : "grid-cols-1")}
        >
          {isPair && (
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-gray-500 mb-1">世帯年収ベース</p>
                <p
                  className={cn(
                    "text-xl font-extrabold",
                    getRiskLevel(ratioTotal, children) === "safe"
                      ? "text-emerald-600"
                      : getRiskLevel(ratioTotal, children) === "warn"
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {ratioTotal.toFixed(1)}%
                </p>
                <RiskBadge level={getRiskLevel(ratioTotal, children)} />
              </CardContent>
            </Card>
          )}
          <Card className="border-2 border-blue-700">
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-gray-500 mb-1">
                {isPair ? "高い方の収入のみ" : "返済比率"}
              </p>
              <p
                className={cn(
                  "text-xl font-extrabold",
                  getRiskLevel(ratioMain, children) === "safe"
                    ? "text-emerald-600"
                    : getRiskLevel(ratioMain, children) === "warn"
                    ? "text-yellow-600"
                    : "text-red-600"
                )}
              >
                {ratioMain.toFixed(1)}%
              </p>
              <RiskBadge level={getRiskLevel(ratioMain, children)} />
            </CardContent>
          </Card>
        </div>
        {isPair && (
          <p className="mt-3 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
            💡 ペアローンの場合、
            <strong>どちらか一方の収入が止まっても返済できるか</strong>
            が重要です。右の数字（高い方の年収ベース）を基準に判断してください。
          </p>
        )}
      </div>

      {/* Rate scenarios */}
      <div className="mb-4">
        <p className="text-sm font-bold text-gray-700 mb-3">金利上昇シナリオ</p>
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">シナリオ</TableHead>
                <TableHead className="text-xs text-right">月額返済</TableHead>
                <TableHead className="text-xs text-right">現在との差</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((s, i) => (
                <TableRow key={i} className={i === 0 ? "bg-blue-50" : ""}>
                  <TableCell
                    className={cn("text-sm", i === 0 && "font-bold")}
                  >
                    {s.label} ({s.rate.toFixed(1)}%)
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-sm font-bold text-right",
                      i > 1 ? "text-red-600" : "text-gray-900"
                    )}
                  >
                    {s.monthly.toFixed(1)}万円
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-sm text-right",
                      i === 0 ? "text-gray-400" : "text-red-600"
                    )}
                  >
                    {i === 0
                      ? "―"
                      : `+${(s.monthly - scenarios[0].monthly).toFixed(1)}万円`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Overall diagnosis */}
      <Alert
        className={cn(
          overallLevel === "safe"
            ? "bg-emerald-50 border-emerald-200"
            : overallLevel === "warn"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-red-50 border-red-200"
        )}
      >
        <AlertDescription>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-gray-900">総合診断：</span>
            <RiskBadge level={overallLevel} />
          </div>
          <p className="text-sm text-gray-700">{diagnosisText()}</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────

export default function App() {
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");

  const handleUnlock = () => {
    if (password === PASSWORD) {
      setUnlocked(true);
      setError(false);
      setActiveTab("paid");
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'Hiragino Sans', 'Yu Gothic', sans-serif" }}
    >
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-7">
          <p className="text-xs font-bold tracking-widest text-blue-700 uppercase mb-2">
            Housing Loan Simulator
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">
            住宅ローン
            <br />
            シミュレーター
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            あなたの借り方は本当に大丈夫ですか？
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
          {(["free", "paid"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 py-2 rounded-lg font-bold text-sm transition-all",
                activeTab === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              )}
            >
              {key === "free" ? "無料版" : "有料版 🔒"}
            </button>
          ))}
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            {activeTab === "free" && <FreeSimulator />}

            {activeTab === "paid" && !unlocked && (
              <div className="text-center py-5">
                <div className="text-5xl mb-4">🔒</div>
                <p className="text-base font-bold text-gray-900 mb-2">
                  有料版
                </p>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  ペアローンvs単独ローンの比較、金利2〜3%上昇シナリオ、子供の数を加味した総合リスク診断が利用できます。
                  <br />
                  noteの有料記事に掲載のパスワードを入力してください。
                </p>
                <Input
                  type="password"
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  className={cn("mb-3", error && "border-red-400")}
                />
                {error && (
                  <p className="text-xs text-red-500 mb-3">
                    パスワードが違います
                  </p>
                )}
                <Button
                  onClick={handleUnlock}
                  className="w-full bg-blue-700 hover:bg-blue-800 font-bold"
                >
                  解除する
                </Button>
              </div>
            )}

            {activeTab === "paid" && unlocked && <PaidSimulator />}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
          本ツールは情報提供を目的としており、個別の財務アドバイスではありません。
          <br />
          実際の借入判断は専門家にご相談ください。
        </p>
      </div>
    </div>
  );
}
