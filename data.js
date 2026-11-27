// 無脊椎動物なかま分けの問題を作る（ブラウザと node の両方で使う）。
// 中身は、大阪府教育委員会の中学2年理科 確認プリント（解答）・岩手県立博物館「けんぱくものしりシート」クモ・京都大学白浜水族館「節足動物」・兵庫県立人と自然の博物館「ハーモニー」・お茶の水女子大学湾岸生物教育研究センター「海洋生物」（下の SRC。2026-11-17 に読んだ）で確かめたことだけ。
// 1問は、背骨のない動物のからだのつくりを見て、なかま（昆虫類・甲殻類・クモ類・多足類・軟体動物）を選ぶ。正解したら2段目「あしは？」を選ぶ。
// 背骨のある動物は doubutsu-nakama が扱うので、ここでは扱わない。
// 選び肢は、ほかの4つから選ぶ（やさしいは2つ、ふつう・むずかしいは3つ）。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    osaka: ["大阪府教育委員会 中学2年理科「動物のなかま」確認プリント（解答）", "https://www.pref.osaka.lg.jp/documents/25642/rika_2nen_16_1kaku_kai.pdf"],
    iwate: ["岩手県立博物館「けんぱくものしりシート」No.31 クモ", "https://www2.pref.iwate.jp/~hp0910/kenpaku/pdf/k5_31.pdf"],
    kyoto: ["京都大学白浜水族館「節足動物」", "https://www.seto.kyoto-u.ac.jp/shirahama_aqua/wp-content/uploads/2023/03/sessoku-doubutsu.pdf"],
    hito: ["兵庫県立人と自然の博物館「ハーモニー」125号（クモの話）", "https://hitohaku.jp/publication/newspaper/harmony125-23.pdf"],
    ocha: ["お茶の水女子大学湾岸生物教育研究センター「海洋生物」", "https://www.cf.ocha.ac.jp/marine/j/menu/schedule/d015299_d/fil/MarineAnimals.pdf"],
  };

  // 答えになる5つ（大阪府のプリントなどの言い方）
  const CLASSES = ["昆虫類", "甲殻類", "クモ類", "多足類", "軟体動物"];

  // 2段目「あしは？」の3つ
  const GROUPS = {
    roku: { name: "あしは6本", sub: "胸に3対" },
    ooi: { name: "あしは8本以上", sub: "節のあるあしが多い" },
    nashi: { name: "節のあるあしはない", sub: "内臓を外とう膜がおおう" },
  };
  // からだのつくり（「なぜ」に出す）
  const CATS = { sanbu: "頭部・胸部・腹部の3つ", kara: "外骨格（かたい殻）で、あしが昆虫より多い", nibu: "頭胸部・腹部の2つ", taisetsu: "よく似た体節がたくさん並ぶ", gaitou: "外とう膜が内臓をおおう" };
  // 答えごとの決まり。2段目・つくり・決め手はこの表で決まる（qa/run.mjs が別に持った表でも確かめる）
  const RULE = {
    "昆虫類": { grp: "roku", cat: "sanbu", key: "からだが頭部・胸部・腹部に分かれ、胸部に3対（6本）のあしと、ふつう2対のはねがあります。" },
    "甲殻類": { grp: "ooi", cat: "kara", key: "エビ・カニのなかま。全身が外骨格でおおわれ、からだやあしが節に分かれ、あしの数は昆虫類より多いです。" },
    "クモ類": { grp: "ooi", cat: "nibu", key: "からだが頭胸部と腹部の2つに分かれ、頭胸部に4対（8本）のあしがあります。糸を出します。" },
    "多足類": { grp: "ooi", cat: "taisetsu", key: "ムカデ・ヤスデのなかま。よく似た体節がたくさん並び、体節ごとにあしがあります。" },
    "軟体動物": { grp: "nashi", cat: "gaitou", key: "イカ・タコ・貝のなかま。背骨も節もなく、内臓を外とう膜がおおっています。" },
  };

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  const MEDIA = ["理科室で", "理科の授業で", "観察ノートで", "水族館で", "テスト勉強で"];
  // 問いの前につく言い方（どれでも答えは同じ）
  const PRE = ["観察した。", "図鑑で。", "見つけた。", "こんな生き物。", "しらべた。"];

  // どれかを当てる問題。ans：答え、sit：言い方。選び肢は、ほかの4つから（やさしいは2つ、ふつう・むずかしいは3つ）
  function which(ans, sit) {
    const near = CLASSES.filter((c) => c !== ans);
    return (R, lv) => {
      const si = ri(R, 0, sit.length - 1), mi = ri(R, 0, MEDIA.length - 1);
      const n = lv === 0 ? 2 : 3, ds = pickN(R, near, n);
      const q = sit[si] + "　どのなかま？";
      return { type: "act", media: MEDIA[mi], q, opts: shuffle(R, [ans, ...ds]), ans, rev: false, v: `${si}:${mi}` };
    };
  }
  // 1つの種類を作る。grp・cat・key は答えの決まり RULE から。clue は手がかりの文（PRE と組む）
  function K(id, lv, ans, name, src, look, why, clue) {
    const r = RULE[ans];
    return { id, lv, grp: r.grp, cat: r.cat, ans, name, src, look, key: r.key, why, make: which(ans, clue.flatMap((c) => PRE.map((p) => p + c))) };
  }

  const KINDS = [
    // ---- やさしい ----
    K("i_sanbu", 0, "昆虫類", "からだが3つ・あし6本", ["osaka", "iwate"], "からだはいくつに分かれていますか。",
      "からだが頭部・胸部・腹部に分かれ、胸部に3対のあしがあるのは昆虫類です（大阪府のプリント・岩手県立博物館）。",
      ["からだが頭・胸・腹の3つに分かれ、胸から6本のあしが出ている。", "胸に6本のあしと、2対のはねがある。からだは3つに分かれる。"]),
    K("k_kani", 0, "甲殻類", "カニ・エビ", ["osaka", "ocha"], "かたい殻とあしの数に注目。",
      "エビ・カニのなかまは、全身が外骨格でおおわれ、あしの数は昆虫類より多い甲殻類です（大阪府のプリント・お茶の水女子大学）。",
      ["海の岩場のカニ。かたい殻でおおわれ、はさみのほかにもあしが何本もある。", "イセエビ。かたい殻でおおわれ、からだもあしも節に分かれている。"]),
    K("s_nibu", 0, "クモ類", "からだが2つ・あし8本", ["iwate", "hito"], "からだの分かれ方とあしの数です。",
      "からだが頭胸部と腹部の2つに分かれ、頭胸部に8本のあしがあるのはクモ類です（岩手県立博物館）。",
      ["からだが頭胸部と腹部の2つに分かれ、あしは8本。おしりから糸を出す。", "ジョロウグモ。網をはり、あしは8本、からだは2つに分かれる。"]),
    K("t_mukade", 0, "多足類", "ムカデ", ["kyoto", "hito"], "あしがとても多い生き物です。",
      "ムカデは、よく似た体節がたくさん並び、体節ごとにあしがある多足類です（京都大学白浜水族館・人と自然の博物館）。",
      ["ムカデ。細長いからだに体節がずらりと並び、あしがとても多い。", "落ち葉の下のムカデ。どの体節にもあしがついている。"]),
    K("n_tako", 0, "軟体動物", "タコ", ["osaka", "ocha"], "背骨もかたい殻もありません。",
      "タコは背骨も節もなく、内臓を外とう膜がおおっている軟体動物です（大阪府のプリント・お茶の水女子大学）。",
      ["マダコ。背骨も、かたい殻もない。内臓を外とう膜がおおっている。", "海にすむタコ。やわらかいからだで、内臓は外とう膜につつまれている。"]),
    // ---- ふつう ----
    K("i_tonbo", 1, "昆虫類", "トンボ・ハチ・ガ", ["iwate", "kyoto", "osaka"], "はねとあしの数を数えましょう。",
      "トンボ・スズメバチ・オオミズアオ（ガ）は、からだが3つに分かれ、胸に6本のあしがある昆虫類です（岩手県立博物館・京都大学白浜水族館）。",
      ["トンボ。4枚のはねと6本のあしがあり、からだは頭・胸・腹に分かれる。", "スズメバチ。胸から6本のあしと2対のはねが出ている。", "オオミズアオ（ガ）。胸に6本のあしと大きなはねがある。"]),
    K("k_dango", 1, "甲殻類", "ダンゴムシ", ["ocha", "osaka"], "「ムシ」という名前ですが、あしの数は？",
      "ダンゴムシは「虫」と呼ばれますが、エビ・カニと同じ甲殻類です。あしの数は6本より多いです（お茶の水女子大学・大阪府のプリント）。",
      ["ダンゴムシ。「ムシ」と呼ばれるが、あしは6本より多く、かたい殻でおおわれる。", "ヤドカリ。貝がらに入っているが、からだもあしも節に分かれた殻でおおわれる。"]),
    K("s_haetori", 1, "クモ類", "ハエトリグモ", ["iwate", "hito"], "網をはらなくても、あしの数は同じです。",
      "ハエトリグモのように網をはらずに狩るものもいますが、どれも糸を出せ、あしは8本です（岩手県立博物館・人と自然の博物館）。",
      ["ハエトリグモ。網をはらずにとびついて狩るが、糸は出せる。あしは8本。", "オニグモ。夜に大きな網をはる。からだは2つ、あしは8本。"]),
    K("t_yasude", 1, "多足類", "ヤスデ・ゲジ", ["kyoto", "hito", "ocha"], "からだの節とあしの多さに注目。",
      "ヤスデやゲジも、よく似た体節がたくさん並び、あしがとても多い多足類です（京都大学白浜水族館・人と自然の博物館）。",
      ["ヤスデ。細長いからだの体節にあしがずらりと並び、さわると丸まる。", "ゲジ。長いあしがたくさんあり、体節がいくつも並んでいる。"]),
    K("n_kai", 1, "軟体動物", "サザエ・アコヤガイ", ["ocha", "osaka"], "貝のなかまです。",
      "サザエ（巻貝）やアコヤガイ（二枚貝）は、内臓を外とう膜がおおっている軟体動物です（お茶の水女子大学・大阪府のプリント）。",
      ["サザエ。巻いた貝がらの中のやわらかいからだを、外とう膜がおおっている。", "アコヤガイ。2枚の貝がらをもち、やわらかいからだに節はない。"]),
    // ---- むずかしい ----
    K("i_hanenashi", 2, "昆虫類", "はねがなくても", ["iwate", "osaka"], "はねよりも、からだとあしで決めます。",
      "はねのないものも一部にいますが、からだが頭・胸・腹の3つで、胸に6本のあしがあれば昆虫類です（岩手県立博物館・大阪府のプリント）。",
      ["はねはない。それでも、からだは頭・胸・腹の3つで、胸に6本のあしがある。"]),
    K("k_fujitsubo", 2, "甲殻類", "フジツボ", ["ocha", "kyoto"], "貝に見えても、エビ・カニと同じなかまです。",
      "フジツボは岩について動かず貝のように見えますが、エビ・カニと同じ甲殻類です（お茶の水女子大学・京都大学白浜水族館）。",
      ["フジツボ。岩にくっついて動かず貝のように見えるが、エビやカニと同じなかま。"]),
    K("s_kyokaku", 2, "クモ類", "触角の位置にはさみ", ["hito", "iwate"], "触角がある所に、何がありますか。",
      "クモは、触角をもつ虫とちがい、その位置にはさみのような鋏角をもちます。からだは2つ、あしは8本です（人と自然の博物館・岩手県立博物館）。",
      ["触角をもつ虫とちがい、その位置にはさみのような鋏角がある。あしは8本。"]),
    K("t_taisetsu", 2, "多足類", "体節とあしがみな同じ形", ["kyoto"], "からだの場所で形が変わるかどうかです。",
      "エビや昆虫は体の部位で形が変わりますが、ムカデのなかまは体節とあしの形がどれもよく似ています（京都大学白浜水族館）。",
      ["からだの部位で形が変わらず、どの体節もあしの形もよく似ていて、陸にすむ。"]),
    K("n_ika", 2, "軟体動物", "イカ", ["ocha", "osaka"], "腕はあっても、節はありますか。",
      "イカは足のような腕をもちますが節はなく、内臓を外とう膜がおおう軟体動物です（お茶の水女子大学・大阪府のプリント）。",
      ["アオリイカ。10本の腕があるが節には分かれていない。内臓は外とう膜につつまれる。"]),
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // 1問を作る。tag は「種類|種」（例 "i_sanbu|2026-11-18:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = BY[kind];
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: k.grp, cat: k.cat, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const MSK = { KINDS, BY, GROUPS, CATS, RULE, LV, SRC, CLASSES, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = MSK; else root.MSK = MSK;
})(typeof self !== "undefined" ? self : this);
