/**
 * All editable site copy and data live here. Components only lay it out.
 * Text is carried over from the original portfolio; change wording here, not in components.
 */

export type Bar = { label: string; value: number; display: string; highlight?: boolean };
export type Pair = { label: string; from: number; to: number };
export type Chart =
  | { kind: "pairs"; title: string; legend: [string, string]; rows: Pair[] }
  | { kind: "bars"; title: string; rows: Bar[] };
export type LinkItem = { label: string; href: string; external?: boolean };

export const site = {
  name: "Sri Sai Hemanth Bollepalli",
  role: "Medical AI researcher",
  locationLine: "Medical image analysis · Sydney, Australia",
  title: "Sri Sai Hemanth Bollepalli · Medical AI Researcher",
  description:
    "Sri Sai Hemanth Bollepalli, medical AI researcher. Brain metastasis segmentation on MRI (BraTS-METS, MICCAI 2026), knee MRI from report-derived labels, skin lesion diagnosis and atrial fibrillation detection from ECGs.",
  /** Set to the deployed origin (no trailing slash) so social cards resolve. See README. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  email: "sshemanthofficial@gmail.com",
  profiles: [
    { label: "GitHub", href: "https://github.com/sshemanth", icon: "github" },
    { label: "LinkedIn", href: "https://linkedin.com/in/sshemanth", icon: "linkedin" },
  ],
  footer: "Sri Sai Hemanth Bollepalli · Medical AI Researcher",
  year: "© 2026",
} as const;

export const nav: LinkItem[] = [
  { label: "Research", href: "#path" },
  { label: "Publications", href: "#publications" },
  { label: "Projects", href: "#work" },
  { label: "Technology", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

/** The three beats of the hero sequence. Timing lives in components/hero/hero.config.ts. */
export const hero = {
  posterAlt: "A deep neural network of translucent glass nodes, with signals travelling between its layers",
  primary: { label: "Read my research", href: "#path" },
  secondary: { label: "Email me", href: `mailto:${site.email}` },
  work: {
    label: "Recent work",
    lead: "My recent work segments brain metastases on post-treatment MRI, including the resection cavity left after surgery, which is the hardest region for standard models.",
    rest: "I also work with knee MRI, dermatology images and 12-lead ECGs. In each project I look for the cases where the model fails and check whether its results hold on data it was never tuned on.",
    stat: { value: "0.238 → 0.586", caption: "Resection cavity F1 against a standard nnU-Net, BraTS-METS 2026" },
  },
  ask: {
    label: "Open to PhD positions",
    lead: "I am looking for a PhD position in medical image analysis.",
    rest: "If this work is close to what your group does, I would be glad to talk.",
  },
};

export const facts = [
  { value: "0.238 → 0.586", caption: "Resection cavity F1 against a standard nnU-Net, BraTS-METS 2026" },
  { value: "0.880", caption: "Macro AUC on the hidden test set, knee MRI trained on report-derived labels" },
  { value: "3 hospitals", caption: "ECG sources in the AF study: one for training, two held out for testing" },
];

export const path = {
  label: "Research path",
  heading: "From a challenge entry to lesion-level guarantees",
  intro: "My brain metastasis work has moved in three steps. Each one started from what the step before it could not do.",
  steps: [
    {
      id: "step-1",
      no: "01",
      kind: ["Challenge paper", "MICCAI 2026"],
      title: "Region-aware segmentation of post-treatment brain metastases",
      body: [
        "For the BraTS-METS 2026 challenge I built a five-fold residual encoder nnU-Net that segments four regions on multi-sequence MRI: whole tumour, tumour core, enhancing tumour and the resection cavity left after surgery. Cavities are rare and irregular, so a region-weighted Tversky and BCE loss makes missed cavity voxels cost more than false ones, and each region gets its own threshold at inference.",
      ],
      figure: {
        src: "figures/brats-framework",
        width: 1600,
        height: 893,
        alt: "Framework diagram: four MRI sequences go through preprocessing and a residual encoder U-Net trained with a region-aware loss over five folds; at inference the folds are averaged, region-specific thresholds are applied and rule-based post-processing produces the final segmentation",
        caption: "Training uses the region-weighted loss over five folds. Inference averages the folds, applies a threshold per region and enforces the BraTS label hierarchy.",
      },
      charts: [
        {
          kind: "pairs",
          title: "Official BraTS 2026 validation platform",
          legend: ["Standard nnU-Net", "This work"],
          rows: [
            { label: "Resection cavity, instance F1", from: 0.238, to: 0.586 },
            { label: "Resection cavity, Dice", from: 0.459, to: 0.578 },
            { label: "Tumour core, Dice", from: 0.659, to: 0.713 },
            { label: "Enhancing tumour, Dice", from: 0.656, to: 0.698 },
            { label: "Whole tumour, Dice", from: 0.636, to: 0.663 },
          ],
        },
      ] as Chart[],
      note: null as string | null,
      open: "The cavity was still the weakest of the four regions, and lesions smaller than 27 mm³ did not improve at all.",
      status: null as string | null,
      links: [
        { label: "Paper", href: "https://papers.miccai.org/miccai-2026-sat/BraTS_METS_008.html", external: true },
        { label: "Code", href: "https://github.com/sshemanth/brain-tumor-segmentation", external: true },
      ] as LinkItem[],
    },
    {
      id: "step-2",
      no: "02",
      kind: ["Research project", "Supervised by Associate Professor Steve Ling"],
      title: "Recovering the cavities the challenge model missed",
      body: [
        "I made the weakest region the whole project. A Primus V3-S transformer was trained with the same loss, with cavity cases drawn twice as often and half of the forced foreground patches centred on a cavity. Its probabilities were then averaged with the challenge model, and each cavity was also scored as found or missed.",
      ],
      figure: null,
      charts: [
        {
          kind: "bars",
          title: "Resection cavity Dice, one fold of 260 held-out cases",
          rows: [
            { label: "Standard nnU-Net", value: 0.184, display: "0.184" },
            { label: "Challenge model", value: 0.428, display: "0.428" },
            { label: "Primus + cavity sampling", value: 0.495, display: "0.495", highlight: true },
          ],
        },
        {
          kind: "bars",
          title: "Cavities found, lesion-level F1",
          rows: [
            { label: "Challenge model", value: 0.741, display: "0.741 · 30 of 45" },
            { label: "Ensemble", value: 0.8, display: "0.800 · 34 of 45", highlight: true },
          ],
        },
      ] as Chart[],
      note: "One cross-validation fold, so these numbers are not comparable with the official validation scores in step 01.",
      open: "Ten of the fourteen missed cavities had a predicted probability below 0.1, so no threshold could bring them back. Most misses were medium cavities between 100 and 1,000 mm³. The checks also showed that 147 of the 260 validation cases came from patients with another scan in training, because the original folds were not grouped by patient.",
      status: null,
      links: [{ label: "Code", href: "https://github.com/sshemanth/brats-mets-primus-rc", external: true }] as LinkItem[],
    },
    {
      id: "step-3",
      no: "03",
      kind: ["Current work"],
      title: "Lesion-level guarantees for brain metastasis segmentation",
      body: [
        "A better model still misses some lesions, and an average Dice score does not say which ones. I am now applying conformal prediction to post-treatment brain metastasis MRI from BraTS-METS 2026, so the model can give per-lesion statistical guarantees on what it detects and what it may miss.",
        "This work starts from scratch with newly trained models and uses only patient-grouped splits, so no patient appears in both training and testing.",
      ],
      figure: null,
      charts: [] as Chart[],
      note: null,
      open: null as string | null,
      status: "In progress",
      links: [] as LinkItem[],
    },
  ],
};

export const publications = {
  label: "Publications",
  heading: "Publications",
  items: [
    {
      year: "2026",
      title: "Region-Aware Residual Encoder nnU-Net for Multi-Region Brain Metastasis Segmentation",
      author: "S. S. H. Bollepalli",
      venue: "BraTS-METS Challenge, MICCAI 2026",
      links: [
        { label: "Paper", href: "https://papers.miccai.org/miccai-2026-sat/BraTS_METS_008.html", external: true },
        { label: "Code", href: "https://github.com/sshemanth/brain-tumor-segmentation", external: true },
        { label: "Method and results", href: "#step-1" },
      ] as LinkItem[],
      bibtex: `@inproceedings{bollepalli2026regionaware,
  title     = {Region-Aware Residual Encoder nnU-Net for Multi-Region Brain Metastasis Segmentation},
  author    = {Bollepalli, Sri Sai Hemanth},
  booktitle = {BraTS-METS Challenge, MICCAI 2026},
  year      = {2026},
  url       = {https://papers.miccai.org/miccai-2026-sat/BraTS_METS_008.html}
}`,
    },
  ],
};

export const projects = {
  label: "Projects",
  heading: "Other research projects",
  items: [
    {
      year: "2026",
      title: "Knee MRI abnormality detection from report-derived labels",
      context: "Two-person team · RSNA 2026 Knee Abnormality Detection",
      question: "Can twelve knee abnormalities be detected on MRI without expert image labels?",
      body: "Three readers score each radiology report, written in one of six languages: a rule-based labeller, MedGemma-4B, and a 27B Qwen model running locally on a laptop. Their averaged scores train a 2.5D ConvNeXt with one attention map per finding.",
      charts: [
        {
          kind: "bars",
          title: "Report readers, macro AUC against 58 expert-labelled studies",
          rows: [
            { label: "Rule-based", value: 0.683, display: "0.683" },
            { label: "MedGemma-4B", value: 0.768, display: "0.768" },
            { label: "Qwen 27B", value: 0.858, display: "0.858" },
            { label: "Average of three", value: 0.87, display: "0.870", highlight: true },
          ],
        },
        {
          kind: "bars",
          title: "Image model, macro AUC on the hidden test set",
          rows: [
            { label: "Two-reader labels", value: 0.842, display: "0.842" },
            { label: "Three-reader labels", value: 0.865, display: "0.865" },
            { label: "Same, at 384 px", value: 0.88, display: "0.880", highlight: true },
          ],
        },
      ] as Chart[],
      miniFacts: [] as { value: string; caption: string }[],
      finding: "Label quality set the ceiling. Adding the third report reader raised the hidden-test AUC from 0.842 to 0.865, a larger gain than any change to the image model. A bigger ConvNeXt scored lower on the expert-labelled studies.",
      note: null as string | null,
      links: [{ label: "Code", href: "https://github.com/sshemanth/knee-mri-weak-supervision", external: true }] as LinkItem[],
    },
    {
      year: "2026",
      title: "Multimodal skin lesion diagnosis with rare classes",
      context: "MILK10k / ISIC challenge",
      question: "How well can clinical and dermoscopic images, together with patient metadata, classify eleven lesion types when some types are very rare?",
      body: "Each image view and the metadata have their own encoder, joined in a shared multi-label head. Rare classes are oversampled in the training manifests and weighted in the loss.",
      charts: [
        {
          kind: "bars",
          title: "Official challenge score on the hidden test set",
          rows: [
            { label: "EfficientNet-B0", value: 0.464, display: "0.464" },
            { label: "ConvNeXt-Base, rare-class oversampling", value: 0.5, display: "0.500" },
            { label: "70 / 30 ensemble of both", value: 0.515, display: "0.515", highlight: true },
          ],
        },
      ] as Chart[],
      miniFacts: [],
      finding: "Swin backbones and pretraining on external ISIC data raised cross-validation scores but scored lower on the hidden test. The best official result came from the simpler ensemble trained only on MILK10k.",
      note: null,
      links: [{ label: "Code", href: "https://github.com/sshemanth/multimodal-lesion-diagnosis", external: true }] as LinkItem[],
    },
    {
      year: "2026",
      title: "What atrial fibrillation detectors rely on in 12-lead ECGs",
      context: "Ongoing",
      question: "Does a deep AF detector use atrial signs such as missing P-waves and fibrillatory waves, or only irregular beat timing?",
      body: "A 1D ResNet trained on PTB-XL is tested without retraining on ECGs from Chapman-Shaoxing and Georgia, and compared with a model that sees only RR intervals. Six attribution methods, occlusion and counterfactual edits measure which parts of each beat the model needs. AF with a regular ventricular rate and paced rhythms are analysed on their own, because the timing cue is weak there.",
      charts: [] as Chart[],
      miniFacts: [
        { value: "21,742", caption: "PTB-XL ECGs for training and internal testing, 7.0% AF" },
        { value: "9,794", caption: "Chapman-Shaoxing ECGs, external test only, 18.2% AF" },
      ],
      finding: null as string | null,
      note: "Experiments are running. Results will be added here when they are complete.",
      links: [] as LinkItem[],
    },
  ],
};

export const themes = {
  label: "Across projects",
  heading: "What connects this work",
  items: [
    { title: "What segmentation models miss", body: "Small metastases and resection cavities are where brain tumour models lose the most accuracy. My BraTS-METS work weights these regions in the loss, samples cavity cases more often and reports results lesion by lesion as well as by Dice." },
    { title: "Results that hold on new data", body: "I test on data the model never saw while it was tuned: hidden challenge test sets for knee MRI and skin lesions, and ECGs from two other hospitals for atrial fibrillation. In the skin lesion work, the models with the best cross-validation scores did worse on the hidden test." },
    { title: "What a model relies on", body: "In the ECG project I measure whether an AF detector uses atrial activity or only irregular beat timing. On knee MRI, the attention maps showed the model reading the MCL mostly from sagittal images, while radiologists read it on coronal images." },
    { title: "Labels from radiology reports", body: "Expert image labels are scarce, but reports exist for almost every scan. On knee MRI, averaging three report readers gave better labels than any one of them, and those labels raised the hidden-test AUC more than a larger image model did." },
  ],
};

export const technology = {
  label: "Technology",
  heading: "Technology stack",
  groups: [
    { title: "Deep learning", items: ["Python", "PyTorch", "Hugging Face Transformers", "CUDA"] },
    { title: "Data science", items: ["NumPy", "pandas", "SciPy", "scikit-learn", "OpenCV"] },
    { title: "MLOps and tools", items: ["Docker", "Weights & Biases", "Jupyter", "Git", "GitHub"] },
    { title: "Cloud and compute", items: ["AWS SageMaker", "Google Cloud Storage", "Kaggle", "Apple Silicon (MPS)"] },
    { title: "Web development", items: ["Next.js", "Tailwind CSS", "Three.js", "GSAP", "Vercel"] },
  ],
};

export const education = {
  label: "Education",
  heading: "Education",
  items: [
    { years: "2025 – 2027", title: "Master of Artificial Intelligence", detail: "University of Technology Sydney, Australia · coursework completed" },
    { years: "2020 – 2024", title: "Bachelor of Technology in Computer Science", detail: "Jawaharlal Nehru Technological University Kakinada, India" },
  ],
};

export const contact = {
  label: "Contact",
  heading: "Let's connect",
  body: "I am looking for a PhD position in medical image analysis. If this work is close to what your group does, I would be glad to talk.",
};
