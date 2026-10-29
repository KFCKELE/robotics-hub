import React, { useState } from "react";
import { defaultInterviewQuestions } from "../../data/interviewQuestions";
import { InterviewQuestion, EvaluationResult } from "../../types";
import {
  ShieldAlert,
  Sparkles,
  Award,
  Send,
  Loader2,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  BookOpen,
  Filter,
} from "lucide-react";
import confetti from "canvas-confetti";

export const InterviewSimulator: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>("全部专题");
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion>(defaultInterviewQuestions[0]);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [showGoldenAnswer, setShowGoldenAnswer] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const topics = [
    "全部专题",
    "微型舵机与精密微传动(Kpower专项)",
    "绳驱与灵巧手",
    "球头连杆与多自由度",
    "协作臂精密结构",
    "非标锂电设备",
    "机械工艺与DFM",
    "个人经历与项目复盘",
  ];

  const filteredQuestions =
    selectedTopic === "全部专题"
      ? defaultInterviewQuestions
      : defaultInterviewQuestions.filter((q) => q.topic === selectedTopic);

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/interview-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "evaluate",
          question: selectedQuestion.title,
          userAnswer,
          topic: selectedQuestion.topic,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "评估失败");

      setAiEvaluation(data.text);
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      setError(err.message || "评估服务异常");
    } finally {
      setLoading(false);
    }
  };

  const handlePickRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    setSelectedQuestion(filteredQuestions[randomIndex]);
    setUserAnswer("");
    setAiEvaluation(null);
    setShowGoldenAnswer(false);
  };

  return (
    <div id="interview-simulator-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-slate-200 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/50 text-cyan-400 border border-cyan-800/60 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> 大厂技术一面 / 二面总监级实战攻防 // INTERVIEW DRILL
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              机器人与非标研发工程面试攻防题库 & AI 面试官对练
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              针对绳驱灵巧手、球头机构、协作臂刚度优化、精实/恒翼能锂电非标实战及专升本技术蜕变历程深度设题，助您在面试中对答如流、展现总监级工程底蕴。
            </p>
          </div>

          <button
            onClick={handlePickRandomQuestion}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> 随机抽取硬核面试真题
          </button>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTopic === t
                ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider px-1">
            题库列表 ({filteredQuestions.length} 道精选题)
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredQuestions.map((q) => {
              const isSelected = q.id === selectedQuestion.id;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setUserAnswer("");
                    setAiEvaluation(null);
                    setShowGoldenAnswer(false);
                  }}
                  className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/30"
                      : "bg-slate-900/50 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {q.topic}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60">
                      {q.companyTag}
                    </span>
                  </div>

                  <h4 className={`text-xs font-bold line-clamp-2 leading-snug ${isSelected ? "text-cyan-300" : "text-slate-200"}`}>
                    {q.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>难度: <strong className={q.difficulty === "地狱级" ? "text-rose-400" : "text-amber-400"}>{q.difficulty}</strong></span>
                    <span className="text-cyan-400 font-semibold flex items-center">
                      点击对练 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Question Drill & AI Grilling */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Question Box */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500 text-slate-950">
                  {selectedQuestion.topic}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  真题来源: {selectedQuestion.companyTag}
                </span>
              </div>

              <button
                onClick={() => setShowGoldenAnswer(!showGoldenAnswer)}
                className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showGoldenAnswer ? "隐藏参考范例" : "查看教科书满分范例"}
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-100 leading-snug">
              {selectedQuestion.title}
            </h3>

            <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl text-xs text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-400 font-mono">
                <HelpCircle className="w-3.5 h-3.5" />
                面试官考察底层意图：
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedQuestion.interviewerIntent}</p>
            </div>

            {/* Answer Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                您的现场回答草稿（建议套用 STAR 法则：情境、任务、行动、量化成果）：
              </label>
              <textarea
                rows={5}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="在此输入您的回答思路，例如：在卓研智创做绳驱机械手时，我们针对绳索蠕变和回差主要采取了三项措施：1. 材料选用预拉伸Dyneema绳... 2. 机械结构上增加微型轴承导向... 3. 在末端嵌入绝对值编码器..."
                className="w-full text-xs p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setUserAnswer(
                    `【Situation】在研发量产过程中，针对该难题核心痛点...\n【Task】我的核心任务是提高可靠性、降低背隙/迟滞，达到工业量产标准...\n【Action】1. 理论计算与公差链分析；2. 机械结构与材料选型优化；3. 制造工艺与装配治具升级...\n【Result】最终将关键指标提升至...并实现批量稳定交付。`
                  );
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 underline font-mono cursor-pointer"
              >
                填入 STAR 答题骨架模版
              </button>

              <button
                onClick={handleEvaluate}
                disabled={loading || !userAnswer.trim()}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer font-mono"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    AI 资深技术总监正在评估并设伏追问...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    提交并获取 AI 总监级点评与追问
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 font-mono">
                {error}
              </div>
            )}
          </div>

          {/* AI Feedback Report */}
          {aiEvaluation && (
            <div className="bg-slate-950/90 rounded-2xl p-6 text-white border border-cyan-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-100">AI 机器人总监 · 技术答辩深度拆解评估</span>
                </div>
                <span className="text-xs text-cyan-400 font-mono">Gemini 3.7 Flash 实时研判</span>
              </div>

              <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans space-y-2">
                {aiEvaluation}
              </div>
            </div>
          )}

          {/* Golden STAR Answer Accordion */}
          {showGoldenAnswer && (
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-emerald-500/40 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>官方满分答辩示范 (结合您的实际背景打造)：</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-300">
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="font-bold text-emerald-400 font-mono block mb-0.5">[S - Situation 背景]</span>
                  <p className="leading-relaxed text-slate-300">{selectedQuestion.recommendedStarAnswer.situation}</p>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="font-bold text-emerald-400 font-mono block mb-0.5">[T - Task 任务]</span>
                  <p className="leading-relaxed text-slate-300">{selectedQuestion.recommendedStarAnswer.task}</p>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="font-bold text-emerald-400 font-mono block mb-0.5">[A - Action 行动]</span>
                  <p className="leading-relaxed text-slate-300">{selectedQuestion.recommendedStarAnswer.action}</p>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="font-bold text-emerald-400 font-mono block mb-0.5">[R - Result 成果]</span>
                  <p className="leading-relaxed text-slate-300">{selectedQuestion.recommendedStarAnswer.result}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
