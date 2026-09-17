import { CourseStatus, LessonType } from '@prisma/client';
import { SeedCourse } from './types';

export const dataLiteracyCourse: SeedCourse = {
  title: 'Introduction to Data Literacy',
  slug: 'introduction-to-data-literacy',
  shortDescription:
    'An 8-week foundation course designed to help beginners understand, work with, interpret, and communicate data confidently.',
  description:
    'Introduction to Data Literacy (ST-DL101) is an 8-week foundation course designed to help beginners understand, work with, interpret, and communicate data confidently. Learners explore the data lifecycle, Excel, data preparation, statistics, visualization, data ethics, and analytical thinking through practical real-world datasets, answering the core question: Can you look at data, understand what it is telling you, question it appropriately, and communicate what you found?\n\nAssessment Structure:\n• Weekly Assignments & Labs: 20%\n• Mid-Course Assessment: 10%\n• Final Examination: 15%\n• Capstone Project: 45%\n• Participation & Professional Activities: 10%',
  category: 'Data Literacy',
  level: 'Foundation',
  duration: '8 Weeks',
  priceMinor: 2990000, // ₦29,900
  currency: 'NGN',
  sortOrder: 1,
  cta: 'Start Your Data Journey',
  status: CourseStatus.DRAFT,
  benefits: [
    'Beginner-friendly foundation curriculum',
    'Understand & interpret everyday data',
    '8-step analytical workflow from questions to decisions',
    'Hands-on Excel data preparation and cleaning',
    'Statistical thinking, distributions, and correlation',
    'Visual storytelling and dashboard architecture',
    'Data ethics, privacy, and bias awareness',
    'End-to-end Capstone project & portfolio piece',
  ],
  weeks: [
    // =========================================================================
    // WEEK 1: DATA & DATA LITERACY
    // =========================================================================
    {
      weekNumber: 1,
      title: 'Data & Data Literacy',
      description:
        'Foundations of data understanding, variable types, the 7-stage data lifecycle, and developing critical data literacy habits.',
      modules: [
        {
          title: 'Understanding Data',
          description: 'Core concepts of data, information, actionable insight, and data collection sources.',
          lessons: [
            {
              title: 'What Is Data?',
              slug: 'what-is-data',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• What is data?\n• Why data matters\n\nData consists of raw observations, measurements, facts, or signals gathered from the environment. In this lesson, we explore how data forms the raw foundation of evidence-based systems across business, healthcare, and research.\n\n[Instructional content pending]',
              duration: 30,
              isPreview: true,
            },
            {
              title: 'Data, Information and Insight',
              slug: 'data-information-and-insight',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Data vs information\n• Information vs insight\n\nRaw data becomes information when structured, contextualized, and organized. Information becomes actionable insight when analytical interpretation reveals meaningful patterns that guide decisions.\n\n[Instructional content pending]',
              duration: 35,
            },
            {
              title: 'Data in Organizations and Everyday Life',
              slug: 'data-in-organizations-and-everyday-life',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Why organizations use data\n• Data in everyday life\n\nExamining how institutions use data to optimize resources, assess risk, and evaluate outcomes, and how individuals interact with data in consumer and public settings.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Sources of Data',
              slug: 'sources-of-data',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Sources of data\n• Primary data\n• Secondary data\n\nUnderstanding how primary data is collected directly for a specific inquiry, while secondary data leverages existing records, surveys, or published datasets.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Types of Data',
          description:
            'Classifying variables across qualitative, quantitative, discrete, continuous, categorical, numerical, structured, unstructured, and temporal dimensions.',
          lessons: [
            {
              title: 'Qualitative and Quantitative Data',
              slug: 'qualitative-and-quantitative-data',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Qualitative data\n• Quantitative data\n\nQualitative data describes characteristics, attributes, and categories, whereas quantitative data represents measurable numerical quantities.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Discrete and Continuous Data',
              slug: 'discrete-and-continuous-data',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Discrete data\n• Continuous data\n\nDiscrete data represents countable separate values, while continuous data represents measurements along an unbroken scale.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Categorical and Numerical Data',
              slug: 'categorical-and-numerical-data',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Categorical data\n• Numerical data\n\nGrouping variables into nominal/ordinal categories versus interval/ratio numbers.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Structured and Unstructured Data',
              slug: 'structured-and-unstructured-data',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Structured data\n• Unstructured data\n\nContrasting relational tables, schemas, and matrices with text narratives, logs, and freeform inputs.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Time-Series and Cross-Sectional Data',
              slug: 'time-series-and-cross-sectional-data',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Time-series data\n• Cross-sectional data\n\nDistinguishing observations recorded over sequential time intervals from observations captured across entities at a single point in time.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'The Data Lifecycle',
          description:
            'Navigating the complete data lifecycle: Collection → Storage → Preparation → Analysis → Visualization → Communication → Decision.',
          lessons: [
            {
              title: 'Introduction to the Data Lifecycle',
              slug: 'introduction-to-the-data-lifecycle',
              lessonType: LessonType.TEXT,
              content:
                'Overview of the complete 7-stage lifecycle:\nCollection → Storage → Preparation → Analysis → Visualization → Communication → Decision.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Data Collection and Storage',
              slug: 'data-collection-and-storage',
              lessonType: LessonType.TEXT,
              content:
                'Lifecycle stages:\n• Collection\n• Storage\n\nMethods for reliable data intake and secure storage architectures.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Data Preparation and Analysis',
              slug: 'data-preparation-and-analysis',
              lessonType: LessonType.TEXT,
              content:
                'Lifecycle stages:\n• Preparation\n• Analysis\n\nTransforming raw records into consistent datasets and applying computational techniques to answer scoped questions.\n\n[Instructional content pending]',
              duration: 35,
            },
            {
              title: 'Visualization, Communication and Decision',
              slug: 'visualization-communication-and-decision',
              lessonType: LessonType.TEXT,
              content:
                'Lifecycle stages:\n• Visualization\n• Communication\n• Decision\n\nTranslating analytical findings into visual displays and recommendations that inform executive decisions.\n\n[Instructional content pending]',
              duration: 35,
            },
          ],
        },
        {
          title: 'Becoming Data Literate',
          description:
            'Critical questioning, reading tabular and chart representations, spotting context gaps, and identifying misleading information.',
          lessons: [
            {
              title: 'Reading Tables',
              slug: 'reading-tables',
              lessonType: LessonType.TEXT,
              content:
                'How to inspect row headers, column headers, units of measure, sample totals, and data types in tabular presentations.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Reading Charts',
              slug: 'reading-charts',
              lessonType: LessonType.TEXT,
              content:
                'Interpreting axes, legends, scales, and data encodings without misinterpreting the underlying values.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Asking Good Data Questions',
              slug: 'asking-good-data-questions',
              lessonType: LessonType.TEXT,
              content:
                'Formulating precise, measurable questions that connect business and clinical objectives with empirical data.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Assumptions and Context',
              slug: 'assumptions-and-context',
              lessonType: LessonType.TEXT,
              content:
                'Topics covered:\n• Identifying assumptions\n• Understanding context\n\nRecognizing unstated assumptions, sampling limitations, and environmental context that frame data interpretation.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Identifying Misleading Information',
              slug: 'identifying-misleading-information',
              lessonType: LessonType.TEXT,
              content:
                'Techniques for recognizing cherry-picked timeframes, truncated axes, deceptive scales, and flawed comparisons.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Practical Lab & Deliverable',
          description: 'Hands-on variable identification, question design, and Data Literacy Worksheet submission.',
          lessons: [
            {
              title: 'Week 1 Practical Lab: Dataset Variable Classification',
              slug: 'week-1-practical-lab',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Practical Lab Instructions:\nStudents receive a small dataset containing business, education, and healthcare examples.\n\nTasks:\n1. Identify all variables in the dataset.\n2. Classify each variable (qualitative vs quantitative, discrete vs continuous, categorical vs numerical).\n3. Identify possible data sources and collection methods.\n4. Develop five analytical questions that could be answered using this dataset.\n\nResource: Small Multi-Domain Dataset\nSTATUS: Resource pending',
              duration: 60,
            },
            {
              title: 'Week 1 Deliverable: Data Literacy Worksheet',
              slug: 'week-1-deliverable-data-literacy-worksheet',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Deliverable Instructions:\nSubmit your completed Data Literacy Worksheet containing your variable classifications, data source evaluations, and analytical questions.\n\nResource: Data Literacy Worksheet\nSTATUS: Resource pending',
              duration: 45,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // WEEK 2: EXCEL FUNDAMENTALS
    // =========================================================================
    {
      weekNumber: 2,
      title: 'Excel Fundamentals',
      description:
        'Navigating the Excel workbook environment, executing basic arithmetic calculations, applying essential formulas, and utilizing logical and text functions.',
      modules: [
        {
          title: 'Excel Environment',
          description: 'Grid layout, cell referencing, relative addresses, and basic formatting.',
          lessons: [
            {
              title: 'Workbook and Worksheet',
              slug: 'workbook-and-worksheet',
              lessonType: LessonType.TEXT,
              content:
                'Understanding workbooks, multiple worksheets, tabs, navigation shortcuts, and file organization.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Rows, Columns, Cells and Ranges',
              slug: 'rows-columns-cells-and-ranges',
              lessonType: LessonType.TEXT,
              content:
                'Cell coordinates, contiguous and non-contiguous ranges, selections, and name box usage.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Data Entry and Basic Formatting',
              slug: 'data-entry-and-basic-formatting',
              lessonType: LessonType.TEXT,
              content:
                'Best practices for entering clean data, text alignment, fonts, borders, and row/column resizing.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Number Formats and Relative References',
              slug: 'number-formats-and-relative-references',
              lessonType: LessonType.TEXT,
              content:
                'Formatting numbers, currency, percentages, dates, and understanding relative vs absolute cell references.\n\n[Instructional content pending]',
              duration: 35,
            },
          ],
        },
        {
          title: 'Basic Calculations',
          description: 'Executing arithmetic operations directly in Excel formula syntax.',
          lessons: [
            {
              title: 'Addition and Subtraction',
              slug: 'addition-and-subtraction',
              lessonType: LessonType.TEXT,
              content:
                'Writing formulas with addition (+) and subtraction (-) operators and managing operator precedence.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Multiplication and Division',
              slug: 'multiplication-and-division',
              lessonType: LessonType.TEXT,
              content:
                'Applying multiplication (*) and division (/) operators across columns and row totals.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Percentages',
              slug: 'percentages',
              lessonType: LessonType.TEXT,
              content:
                'Calculating shares, proportion of total, percentage changes, and formatting percentages accurately.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Essential Functions',
          description: 'Working with standard statistical and aggregation formulas.',
          lessons: [
            {
              title: 'SUM and AVERAGE',
              slug: 'sum-and-average',
              lessonType: LessonType.TEXT,
              content:
                'Syntax and practical application of the SUM and AVERAGE functions on numerical columns.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'COUNT and COUNTA',
              slug: 'count-and-counta',
              lessonType: LessonType.TEXT,
              content:
                'Distinguishing COUNT (numeric cells) from COUNTA (non-empty cells) when assessing completeness.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'MIN and MAX',
              slug: 'min-and-max',
              lessonType: LessonType.TEXT,
              content:
                'Using MIN and MAX to evaluate ranges, identify boundary values, and inspect data spreads.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'COUNTIF and SUMIF',
              slug: 'countif-and-sumif',
              lessonType: LessonType.TEXT,
              content:
                'Conditional counting and aggregation based on defined criteria and text filters.\n\n[Instructional content pending]',
              duration: 35,
            },
          ],
        },
        {
          title: 'Logical & Text Functions',
          description: 'Evaluating conditional rules and cleaning or transforming text strings.',
          lessons: [
            {
              title: 'IF and IFS',
              slug: 'if-and-ifs',
              lessonType: LessonType.TEXT,
              content:
                'Writing single-condition IF statements and multi-condition IFS evaluations to categorize records.\n\n[Instructional content pending]',
              duration: 35,
            },
            {
              title: 'AND and OR',
              slug: 'and-and-or',
              lessonType: LessonType.TEXT,
              content:
                'Combining logical tests with AND and OR for complex rule evaluation.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'CONCAT',
              slug: 'concat',
              lessonType: LessonType.TEXT,
              content:
                'Joining strings, combining first and last names, and creating compound identifiers.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'LEFT, RIGHT and MID',
              slug: 'left-right-and-mid',
              lessonType: LessonType.TEXT,
              content:
                'Extracting substrings, codes, prefixes, and fixed-width segments from raw data fields.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'TRIM',
              slug: 'trim-function',
              lessonType: LessonType.TEXT,
              content:
                'Removing leading, trailing, and unnecessary internal spaces from entered text.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Practical Lab & Assignment',
          description: 'Student performance calculations and building a personal budget tracker.',
          lessons: [
            {
              title: 'Week 2 Practical Lab: Student Performance Dataset',
              slug: 'week-2-practical-lab',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Practical Lab Instructions:\nUsing the Student Performance Dataset, calculate the following metrics using Excel formulas:\n• Average score\n• Highest score\n• Lowest score\n• Total number of students\n• Overall pass rate\n• Assign performance categories using IF/IFS\n\nResource: Student Performance Dataset\nSTATUS: Resource pending',
              duration: 60,
            },
            {
              title: 'Week 2 Assignment: Personal Budget & Expense Tracker',
              slug: 'week-2-assignment',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Assignment Instructions:\nBuild a Personal Budget & Expense Tracker spreadsheet in Excel. Incorporate formulas for income, expenses, category totals, percentage of budget spent, and savings rates.\n\n[Instructional content pending]',
              duration: 75,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // WEEK 3: DATA PREPARATION & QUALITY
    // =========================================================================
    {
      weekNumber: 3,
      title: 'Data Preparation & Quality',
      description:
        'Auditing messy datasets, executing structured cleaning workflows in Excel, applying cleaning functions, and establishing data validation rules.',
      modules: [
        {
          title: 'Understanding Messy Data',
          description: 'Diagnosing common real-world data quality anomalies and defects.',
          lessons: [
            {
              title: 'Missing Values',
              slug: 'missing-values',
              lessonType: LessonType.TEXT,
              content:
                'Identifying incomplete records, null entries, blanks, and understanding their impact on analytical calculations.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Duplicates',
              slug: 'duplicates',
              lessonType: LessonType.TEXT,
              content:
                'Distinguishing full row duplicates from duplicate entity keys, and understanding inflation of aggregate counts.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Inconsistent Spelling and Categories',
              slug: 'inconsistent-spelling-and-categories',
              lessonType: LessonType.TEXT,
              content:
                'Spotting case variations, typos, and fragmented categorical labels that split reporting groups.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Incorrect Formats and Invalid Values',
              slug: 'incorrect-formats-and-invalid-values',
              lessonType: LessonType.TEXT,
              content:
                'Detecting text stored as numbers, corrupted dates, out-of-range figures, and non-standard identifiers.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Outliers',
              slug: 'outliers-in-raw-data',
              lessonType: LessonType.TEXT,
              content:
                'Observing extreme values during initial data inspection and assessing whether they reflect data errors or authentic events.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Cleaning Data in Excel',
          description: 'Hands-on native Excel tools for data scrubbing and restructuring.',
          lessons: [
            {
              title: 'Remove Duplicates',
              slug: 'remove-duplicates',
              lessonType: LessonType.TEXT,
              content:
                'Using the Remove Duplicates feature safely while preserving raw data integrity.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Sorting and Filtering',
              slug: 'sorting-and-filtering',
              lessonType: LessonType.TEXT,
              content:
                'Applying multi-level sorting and custom filters to inspect distributions and isolate erroneous records.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Find & Replace',
              slug: 'find-and-replace',
              lessonType: LessonType.TEXT,
              content:
                'Standardizing labels, replacing obsolete codes, and avoiding unintended global substitutions.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Text to Columns',
              slug: 'text-to-columns',
              lessonType: LessonType.TEXT,
              content:
                'Splitting delimited strings (commas, spaces, tabs) and fixed-width fields into distinct columns.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Flash Fill',
              slug: 'flash-fill',
              lessonType: LessonType.TEXT,
              content:
                'Leveraging Excel pattern recognition to extract names, formats, and clean substrings efficiently.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Data Cleaning Functions',
          description: 'Formulas for programmatic text and date remediation.',
          lessons: [
            {
              title: 'TRIM',
              slug: 'trim-cleaning',
              lessonType: LessonType.TEXT,
              content:
                'Applying TRIM to sanitize irregular whitespace across text columns.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'CLEAN',
              slug: 'clean-function',
              lessonType: LessonType.TEXT,
              content:
                'Stripping non-printable characters from imported web and database records.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'PROPER, UPPER and LOWER',
              slug: 'proper-upper-lower',
              lessonType: LessonType.TEXT,
              content:
                'Standardizing capitalization across names, states, and text categories.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Text Functions',
              slug: 'text-cleaning-functions',
              lessonType: LessonType.TEXT,
              content:
                'Combining SUBSTITUTE, REPLACE, and LEN to clean complex string patterns.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Date Functions',
              slug: 'date-cleaning-functions',
              lessonType: LessonType.TEXT,
              content:
                'Using DATE, YEAR, MONTH, DAY, and DATEVALUE to fix inconsistent date formats.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Data Validation',
          description: 'Enforcing data entry rules, drop-down controls, and error prevention checks.',
          lessons: [
            {
              title: 'Validation Rules',
              slug: 'validation-rules',
              lessonType: LessonType.TEXT,
              content:
                'Setting constraints for whole numbers, decimal ranges, date boundaries, and text length.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Dropdown Lists',
              slug: 'dropdown-lists',
              lessonType: LessonType.TEXT,
              content:
                'Creating in-cell dropdown lists from static ranges and named reference lists.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Error Prevention',
              slug: 'error-prevention',
              lessonType: LessonType.TEXT,
              content:
                'Configuring input messages and error alerts (Stop, Warning, Information) to guide accurate entry.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Consistency Checks',
              slug: 'consistency-checks',
              lessonType: LessonType.TEXT,
              content:
                'Cross-field verification rules and circle invalid data audits.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Practical Lab & Deliverable',
          description: 'Executing the 5-step data cleaning workflow on a realistic messy dataset.',
          lessons: [
            {
              title: 'Week 3 Practical Lab: Messy Dataset Cleaning Workflow',
              slug: 'week-3-practical-lab',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Practical Lab Instructions:\nStudents receive an intentionally messy dataset.\n\nRequired 5-step workflow:\nInspect → Identify Problems → Clean → Validate → Document\n\nResource: Intentionally Messy Dataset\nSTATUS: Resource pending',
              duration: 60,
            },
            {
              title: 'Week 3 Deliverable: Clean Dataset + Data Quality Report',
              slug: 'week-3-deliverable',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Deliverable Instructions:\nSubmit your final Clean Dataset along with a Data Quality Report.\nCleaning is not simply fixing cells: you must document:\n• What was changed\n• Why it was changed\n\nResource: Clean Dataset + Data Quality Report Template\nSTATUS: Resource pending',
              duration: 60,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // WEEK 4: DATA COMMUNICATION & ETHICS
    // =========================================================================
    {
      weekNumber: 4,
      title: 'Data Communication & Ethics',
      description:
        'Progressing from data to actionable recommendations, data storytelling, visual encoding principles, and ethical data governance.',
      modules: [
        {
          title: 'From Data to Insight',
          description:
            'Preserving the progression: Data → Information → Observation → Interpretation → Recommendation.',
          lessons: [
            {
              title: 'Data',
              slug: 'data-definition-and-scope',
              lessonType: LessonType.TEXT,
              content:
                'Understanding data as the foundational record level (e.g. timestamps, attendance logs, patient records).\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Information',
              slug: 'information-structuring',
              lessonType: LessonType.TEXT,
              content:
                'Structuring data into aggregate metrics (e.g. 32% of patients waited more than two hours).\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Observation',
              slug: 'making-observations',
              lessonType: LessonType.TEXT,
              content:
                'Documenting objective patterns in information without speculation (e.g. waiting times are highest on Monday mornings).\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Interpretation',
              slug: 'interpreting-patterns-and-hypotheses',
              lessonType: LessonType.TEXT,
              content:
                'Formulating hypotheses to explain observed patterns (e.g. Monday morning staffing may be insufficient relative to surge volume).\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Recommendation',
              slug: 'translating-insights-to-action',
              lessonType: LessonType.TEXT,
              content:
                'Translating interpretation into practical management actions (e.g. management should evaluate Monday staffing levels and adjust shift scheduling).\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Data Storytelling',
          description: 'Crafting evidence-backed narratives tailored to organizational audiences.',
          lessons: [
            {
              title: 'Knowing Your Audience',
              slug: 'knowing-your-audience',
              lessonType: LessonType.TEXT,
              content:
                'Tailoring technical depth, terminology, and visual complexity to technical vs executive stakeholders.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Identifying the Key Message',
              slug: 'identifying-the-key-message',
              lessonType: LessonType.TEXT,
              content:
                'Distilling analysis down to the core takeaway that drives action.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Context and Evidence',
              slug: 'context-and-evidence',
              lessonType: LessonType.TEXT,
              content:
                'Supporting claims with benchmark data, historical trends, and sample boundaries.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Recommendation',
              slug: 'story-recommendations',
              lessonType: LessonType.TEXT,
              content:
                'Structuring recommendations with clear trade-offs, next steps, and expected impact.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Executive Communication',
              slug: 'executive-communication',
              lessonType: LessonType.TEXT,
              content:
                'Techniques for concise briefing: bottom-line first, executive summaries, and clear visuals.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Data Visualization Principles',
          description: 'Selecting appropriate encodings, designing clear labels, and preventing visual deception.',
          lessons: [
            {
              title: 'Choosing the Appropriate Chart',
              slug: 'choosing-the-appropriate-chart',
              lessonType: LessonType.TEXT,
              content:
                'Matching chart types to the analytical question: comparison, trend, composition, or relationship.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Chart Titles and Labels',
              slug: 'chart-titles-and-labels',
              lessonType: LessonType.TEXT,
              content:
                'Writing takeaway titles and clear axis labels that immediately convey the finding.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Scale and Context',
              slug: 'scale-and-context',
              lessonType: LessonType.TEXT,
              content:
                'Setting baseline scales, maintaining proportionality, and avoiding distorted perspectives.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Avoiding Unnecessary Decoration',
              slug: 'avoiding-unnecessary-decoration',
              lessonType: LessonType.TEXT,
              content:
                'Eliminating chart junk, unnecessary 3D effects, and decorative noise to maximize data ink.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Misleading Visualizations',
              slug: 'misleading-visualizations',
              lessonType: LessonType.TEXT,
              content:
                'Deconstructing real-world misleading charts: truncated y-axes, uneven binning, and 3D pie distortions.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Data Ethics',
          description: 'Privacy, informed consent, bias, ownership, and algorithmic implications.',
          lessons: [
            {
              title: 'Privacy and Confidentiality',
              slug: 'privacy-and-confidentiality',
              lessonType: LessonType.TEXT,
              content:
                'Protecting personally identifiable information (PII) and maintaining confidentiality in reporting.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Consent',
              slug: 'consent-and-data-rights',
              lessonType: LessonType.TEXT,
              content:
                'Informed consent, purpose limitation, and user rights regarding data collection.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Bias',
              slug: 'bias-in-data-collection',
              lessonType: LessonType.TEXT,
              content:
                'How sampling bias, measurement bias, and historical bias distort datasets and downstream findings.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Data Ownership',
              slug: 'data-ownership',
              lessonType: LessonType.TEXT,
              content:
                'Understanding legal and ethical ownership: subjects, collectors, aggregators, and institutions.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Responsible Data Use',
              slug: 'responsible-data-use',
              lessonType: LessonType.TEXT,
              content:
                'Recognizing how poor data practices cause societal, organizational, and individual harm.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Algorithmic Bias and Data Misuse',
              slug: 'algorithmic-bias-and-data-misuse',
              lessonType: LessonType.TEXT,
              content:
                'Case studies on automated decision-making and how skewed training data perpetuates disparity.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Practical Lab & Deliverable',
          description: 'Critiquing and redesigning intentionally deceptive visual displays.',
          lessons: [
            {
              title: 'Week 4 Practical Lab: Misleading Chart Analysis',
              slug: 'week-4-practical-lab',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Practical Lab Instructions:\nStudents receive intentionally misleading charts.\nTasks:\n1. Identify the problem.\n2. Explain why the visual display is misleading.\n3. Redesign it using sound visualization principles.\n4. Explain the concrete improvement.\n\nResource: Misleading Charts Case Pack\nSTATUS: Resource pending',
              duration: 60,
            },
            {
              title: 'Week 4 Deliverable: Chart Critique & Redesign',
              slug: 'week-4-deliverable',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Deliverable Instructions:\nSubmit your comprehensive Chart Critique & Redesign document.\n\nResource: Chart Critique Template\nSTATUS: Resource pending',
              duration: 45,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // WEEK 5: STATISTICS FUNDAMENTALS I
    // =========================================================================
    {
      weekNumber: 5,
      title: 'Statistics Fundamentals I',
      description:
        'Foundational statistical thinking, measurement scales, measures of central tendency, variability metrics, and analytical judgment regarding outliers.',
      modules: [
        {
          title: 'What Is Statistics?',
          description: 'Descriptive vs inferential concepts, populations, samples, and observation units.',
          lessons: [
            {
              title: 'Why Statistics Matters',
              slug: 'why-statistics-matters',
              lessonType: LessonType.TEXT,
              content:
                'Understanding statistics as the language of variation, uncertainty, and evidence.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Descriptive Statistics',
              slug: 'descriptive-statistics',
              lessonType: LessonType.TEXT,
              content:
                'Summarizing, organizing, and describing characteristics of an observed dataset.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Inferential Statistics',
              slug: 'inferential-statistics-intro',
              lessonType: LessonType.TEXT,
              content:
                'Conceptual introduction to drawing inferences and generalizations from samples to broader populations.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Population and Sample',
              slug: 'population-and-sample',
              lessonType: LessonType.TEXT,
              content:
                'Defining target populations, sampling frames, representativeness, and sampling error.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Variable and Observation',
              slug: 'variable-and-observation',
              lessonType: LessonType.TEXT,
              content:
                'Understanding data tables as matrices of observations (rows) and variables (columns).\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Measurement Scales',
          description: 'Classifying variables across Stevens measurement scales with concrete examples.',
          lessons: [
            {
              title: 'Nominal',
              slug: 'nominal-scale',
              lessonType: LessonType.TEXT,
              content:
                'Nominal scale: labels and categories without intrinsic order (e.g. department, blood type, marital status).\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Ordinal',
              slug: 'ordinal-scale',
              lessonType: LessonType.TEXT,
              content:
                'Ordinal scale: ranked categories with meaningful order but unequal intervals (e.g. satisfaction ratings, education levels).\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Interval',
              slug: 'interval-scale',
              lessonType: LessonType.TEXT,
              content:
                'Interval scale: numerical scale with equal intervals but no true zero (e.g. Celsius temperature, calendar year).\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Ratio',
              slug: 'ratio-scale',
              lessonType: LessonType.TEXT,
              content:
                'Ratio scale: numerical measurements with equal intervals and an absolute zero point (e.g. salary, weight, height, age).\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Central Tendency',
          description: 'Calculating mean, median, mode, and determining the appropriate measure for skewed data.',
          lessons: [
            {
              title: 'Mean',
              slug: 'mean-calculation-and-meaning',
              lessonType: LessonType.TEXT,
              content:
                'Mathematical calculation of the arithmetic mean and its sensitivity to extreme values.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Median',
              slug: 'median-calculation-and-meaning',
              lessonType: LessonType.TEXT,
              content:
                'Determining the middle value of ordered records and why median provides robust summaries for skewed data.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Mode',
              slug: 'mode-calculation-and-meaning',
              lessonType: LessonType.TEXT,
              content:
                'Identifying the most frequently occurring value in categorical and discrete distributions.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Choosing the Appropriate Measure',
              slug: 'choosing-central-tendency-measure',
              lessonType: LessonType.TEXT,
              content:
                'Crucial objective: The mean is not automatically the best summary. When should you use each measure based on distribution shape and measurement scale?\n\n[Instructional content pending]',
              duration: 35,
            },
          ],
        },
        {
          title: 'Variability',
          description: 'Measuring data dispersion, spread, variance, standard deviation, and IQR.',
          lessons: [
            {
              title: 'Range',
              slug: 'range-metric',
              lessonType: LessonType.TEXT,
              content:
                'Calculating simple range (Max - Min) and understanding its vulnerability to outliers.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Variance',
              slug: 'variance-concept',
              lessonType: LessonType.TEXT,
              content:
                'Conceptual understanding of variance as average squared deviations around the mean.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Standard Deviation',
              slug: 'standard-deviation-concept',
              lessonType: LessonType.TEXT,
              content:
                'Standard deviation in the original unit of measurement and interpreting spread.\n\n[Instructional content pending]',
              duration: 35,
            },
            {
              title: 'Interquartile Range',
              slug: 'interquartile-range-concept',
              lessonType: LessonType.TEXT,
              content:
                'Conceptual introduction to percentiles, quartiles (Q1, Q3), and the interquartile range (IQR) as a robust dispersion measure.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Outliers',
          description: 'Evaluating extreme values and applying sound analytical judgment.',
          lessons: [
            {
              title: 'What Is an Outlier?',
              slug: 'what-is-an-outlier',
              lessonType: LessonType.TEXT,
              content:
                'Defining outliers as data points that differ significantly from other observations in the distribution.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Why Outliers Matter',
              slug: 'why-outliers-matter',
              lessonType: LessonType.TEXT,
              content:
                'Assessing how extreme values distort the mean, inflate standard deviation, and alter model results.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Outlier vs Error',
              slug: 'outlier-vs-error',
              lessonType: LessonType.TEXT,
              content:
                'Differentiating data entry/measurement mistakes from authentic rare real-world phenomena.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Should an Outlier Always Be Removed?',
              slug: 'outlier-treatment-and-judgment',
              lessonType: LessonType.TEXT,
              content:
                'Emphasizing analytical judgment: why automatically removing outliers can conceal critical insights.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Practical & Assignment',
          description: 'Manual and Excel calculations of descriptive summary statistics.',
          lessons: [
            {
              title: 'Week 5 Practical: Calculating Statistics Manually and in Excel',
              slug: 'week-5-practical',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Practical Instructions:\nCalculate central tendency and variability metrics first manually on sample subsets, and then using Excel formulas (AVERAGE, MEDIAN, MODE, STDEV.S, VAR.S).\n\nResource: Descriptive Statistics Dataset\nSTATUS: Resource pending',
              duration: 60,
            },
            {
              title: 'Week 5 Assignment: Descriptive Statistics Report',
              slug: 'week-5-assignment',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Assignment Instructions:\nSubmit your Descriptive Statistics Report interpreting mean, median, standard deviation, and outlier analysis for the assigned scenario.\n\n[Instructional content pending]',
              duration: 60,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // WEEK 6: STATISTICS FUNDAMENTALS II
    // =========================================================================
    {
      weekNumber: 6,
      title: 'Statistics Fundamentals II',
      description:
        'Understanding distributions, exploring relationships between variables, correlation vs causation, introductory probability, and hypothesis thinking.',
      modules: [
        {
          title: 'Understanding Distribution',
          description: 'Frequency tables, bell curves, skewness, and the geometry of distributions.',
          lessons: [
            {
              title: 'Frequency',
              slug: 'frequency-concepts',
              lessonType: LessonType.TEXT,
              content:
                'Constructing frequency tables and grouping data into intervals.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Distribution',
              slug: 'distribution-patterns',
              lessonType: LessonType.TEXT,
              content:
                'Understanding the shape, spread, and center of empirical distributions.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Normal Distribution',
              slug: 'normal-distribution',
              lessonType: LessonType.TEXT,
              content:
                'Properties of the symmetrical bell curve and the empirical rule (68-95-99.7).\n\n[Instructional content pending]',
              duration: 35,
            },
            {
              title: 'Skewness and Symmetry',
              slug: 'skewness-and-symmetry',
              lessonType: LessonType.TEXT,
              content:
                'Recognizing positive (right-skewed) and negative (left-skewed) distributions and their impact on mean vs median.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Outliers and Distribution',
              slug: 'outliers-and-distribution',
              lessonType: LessonType.TEXT,
              content:
                'Visualizing outlier positions in boxplots and long-tailed distributions.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Relationships Between Variables',
          description: 'Examining co-variation, correlation direction, and strength.',
          lessons: [
            {
              title: 'What Is Correlation?',
              slug: 'what-is-correlation',
              lessonType: LessonType.TEXT,
              content:
                'Defining correlation as the statistical measure of linear association between two variables.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Positive Correlation',
              slug: 'positive-correlation',
              lessonType: LessonType.TEXT,
              content:
                'Understanding positive relationships where variables increase or decrease together.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Negative Correlation',
              slug: 'negative-correlation',
              lessonType: LessonType.TEXT,
              content:
                'Understanding inverse relationships where an increase in one variable corresponds to a decrease in another.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'No Correlation',
              slug: 'no-correlation',
              lessonType: LessonType.TEXT,
              content:
                'Identifying scatter plots with random distributions indicating independence.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Strength of Relationship',
              slug: 'strength-of-relationship',
              lessonType: LessonType.TEXT,
              content:
                'Interpreting correlation coefficient r from -1.0 to +1.0 conceptually.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Correlation vs Causation',
          description: 'A major conceptual module separating correlation from causal mechanisms.',
          lessons: [
            {
              title: 'Understanding Correlation',
              slug: 'understanding-correlation-depth',
              lessonType: LessonType.TEXT,
              content:
                'Reviewing observed numerical associations between variables.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Understanding Causation',
              slug: 'understanding-causation',
              lessonType: LessonType.TEXT,
              content:
                'Defining causality: establishing that change in one variable directly produces change in another.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Why Correlation Does Not Prove Causation',
              slug: 'correlation-does-not-equal-causation',
              lessonType: LessonType.TEXT,
              content:
                'Major conceptual lesson with real-world examples: confounding variables, spurious correlations, and reverse causality.\n\n[Instructional content pending]',
              duration: 40,
            },
          ],
        },
        {
          title: 'Introduction to Probability',
          description: 'Conceptual foundations of likelihood and event relationships.',
          lessons: [
            {
              title: 'Probability as Likelihood',
              slug: 'probability-as-likelihood',
              lessonType: LessonType.TEXT,
              content:
                'Expressing likelihood on a scale from 0 (impossible) to 1 (certain).\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Simple Probability',
              slug: 'simple-probability',
              lessonType: LessonType.TEXT,
              content:
                'Calculating basic probabilities as favorable outcomes over total possible outcomes.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Independent Events',
              slug: 'independent-events',
              lessonType: LessonType.TEXT,
              content:
                'Understanding occurrences where the outcome of one event does not influence another.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Dependent Events',
              slug: 'dependent-events',
              lessonType: LessonType.TEXT,
              content:
                'Recognizing conditional scenarios where previous outcomes alter subsequent probabilities.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Introduction to Hypothesis Thinking',
          description: 'Formulating empirical questions, null/alternative hypotheses, and conceptual significance.',
          lessons: [
            {
              title: 'Question and Hypothesis',
              slug: 'question-and-hypothesis',
              lessonType: LessonType.TEXT,
              content:
                'Transforming general business or health inquiries into testable hypothesis statements.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Evidence',
              slug: 'evaluating-evidence',
              lessonType: LessonType.TEXT,
              content:
                'Gathering appropriate sample evidence and establishing criteria to evaluate claims.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Null and Alternative Hypotheses',
              slug: 'null-and-alternative-hypotheses',
              lessonType: LessonType.TEXT,
              content:
                'Framing the null hypothesis (status quo/no difference) against the alternative hypothesis (effect/change).\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Statistical Significance',
              slug: 'statistical-significance-concept',
              lessonType: LessonType.TEXT,
              content:
                'Introductory and conceptual: understanding significance as assessing whether an observation is unlikely to have occurred purely by chance.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Practical & Assessment',
          description: 'Analyzing bivariate relationships and completing the Mid-Course Assessment.',
          lessons: [
            {
              title: 'Week 6 Practical: Analyzing Relationships Between Variables in Excel',
              slug: 'week-6-practical',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Practical Instructions:\nUse Excel scatter plots and the CORREL function to evaluate relationships between candidate variables.\n\nResource: Bivariate Practice Dataset\nSTATUS: Resource pending',
              duration: 60,
            },
            {
              title: 'Week 6 Assessment: Mid-Course Assessment',
              slug: 'week-6-assessment',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Mid-Course Assessment Instructions:\nWeight: 10% of overall course grade.\nComponents:\n1. Theory: Data literacy foundations, variable classification, and statistical concepts.\n2. Excel Practical: Data cleaning, formula execution, and summary reporting.\n\n[Instructional content pending]',
              duration: 90,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // WEEK 7: DATA VISUALIZATION & DASHBOARDS
    // =========================================================================
    {
      weekNumber: 7,
      title: 'Data Visualization & Dashboards',
      description:
        'Selecting the right chart for analytical inquiries, chart construction in Excel, pivot tables, pivot charts, and structured executive dashboard design.',
      modules: [
        {
          title: 'Choosing the Right Visualization',
          description:
            'Matching chart types to analytical questions. (Note: Pie charts should not be taught as a default).',
          lessons: [
            {
              title: 'Visualization and Analytical Questions',
              slug: 'visualization-and-analytical-questions',
              lessonType: LessonType.TEXT,
              content:
                'Core principle: Chart choice depends on the analytical question you are answering.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Comparison',
              slug: 'comparison-bar-column-charts',
              lessonType: LessonType.TEXT,
              content:
                'Recommended chart: Bar / Column charts for comparing values across discrete categories.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Trend',
              slug: 'trend-line-charts',
              lessonType: LessonType.TEXT,
              content:
                'Recommended chart: Line charts for evaluating change over continuous temporal intervals.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Relationship',
              slug: 'relationship-scatter-plots',
              lessonType: LessonType.TEXT,
              content:
                'Recommended chart: Scatter plots for inspecting correlation between two continuous variables.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Composition',
              slug: 'composition-stacked-charts',
              lessonType: LessonType.TEXT,
              content:
                'Using stacked bar/column charts where part-to-whole relationships are appropriate.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Distribution',
              slug: 'distribution-histograms',
              lessonType: LessonType.TEXT,
              content:
                'Recommended chart: Histograms for visualizing continuous frequency distributions.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Building Charts in Excel',
          description: 'Hands-on chart formatting, axis configuration, and labeling in Excel.',
          lessons: [
            {
              title: 'Column Charts',
              slug: 'building-column-charts',
              lessonType: LessonType.TEXT,
              content:
                'Constructing and formatting vertical column charts in Excel.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Bar Charts',
              slug: 'building-bar-charts',
              lessonType: LessonType.TEXT,
              content:
                'Building horizontal bar charts, ideal for long category labels.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Line Charts',
              slug: 'building-line-charts',
              lessonType: LessonType.TEXT,
              content:
                'Creating single and multi-series line charts with appropriate time intervals.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Scatter Plots',
              slug: 'building-scatter-plots',
              lessonType: LessonType.TEXT,
              content:
                'Plotting bivariate pairs and adding linear trendlines in Excel.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Histograms',
              slug: 'building-histograms',
              lessonType: LessonType.TEXT,
              content:
                'Configuring bin widths, bin counts, and frequency distributions.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Appropriate Labeling',
              slug: 'appropriate-chart-labeling',
              lessonType: LessonType.TEXT,
              content:
                'Applying clear units, descriptive titles, direct labeling, and suppressing redundant legends.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Pivot Tables',
          description: 'Summarizing and slicing tabular data dynamically.',
          lessons: [
            {
              title: 'Creating Pivot Tables',
              slug: 'creating-pivot-tables',
              lessonType: LessonType.TEXT,
              content:
                'Creating PivotTables from structured tabular datasets.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Grouping',
              slug: 'pivot-table-grouping',
              lessonType: LessonType.TEXT,
              content:
                'Grouping dates by months/quarters and numerical values into bins.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Aggregation',
              slug: 'pivot-table-aggregation',
              lessonType: LessonType.TEXT,
              content:
                'Configuring Sum, Count, Average, Min, Max, and percentage of column totals.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Filtering',
              slug: 'pivot-table-filtering',
              lessonType: LessonType.TEXT,
              content:
                'Applying report filters, value filters, and top-10 rules.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Slicers',
              slug: 'pivot-table-slicers',
              lessonType: LessonType.TEXT,
              content:
                'Inserting visual interactive slicers for quick category filtering.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Pivot Charts',
          description: 'Linking dynamic visual displays to PivotTable aggregations.',
          lessons: [
            {
              title: 'Connecting Charts',
              slug: 'connecting-pivot-charts',
              lessonType: LessonType.TEXT,
              content:
                'Creating PivotCharts that automatically update when underlying PivotTables re-aggregate.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Interactive Filtering',
              slug: 'interactive-filtering',
              lessonType: LessonType.TEXT,
              content:
                'Connecting a single slicer to multiple PivotTables and charts simultaneously.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Dashboard Structure',
              slug: 'dashboard-structure-overview',
              lessonType: LessonType.TEXT,
              content:
                'Planning the visual information hierarchy before placing charts.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Dashboard Design',
          description:
            'Teaching the standardized layout: TITLE → KPI 1-4 → TREND | COMPARISON → KEY INSIGHTS.',
          lessons: [
            {
              title: 'Dashboard Layout Architecture',
              slug: 'dashboard-layout-architecture',
              lessonType: LessonType.TEXT,
              content:
                'Standard layout hierarchy:\n1. TITLE (Header & context)\n2. KPI CARDS (KPI 1 | KPI 2 | KPI 3 | KPI 4)\n3. MAIN VISUALS (Trend | Comparison)\n4. KEY INSIGHTS (Bullet commentary & takeaways)\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'KPI Card Construction',
              slug: 'kpi-card-construction',
              lessonType: LessonType.TEXT,
              content:
                'Designing high-impact single-metric KPI cards with comparison benchmarks.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Connecting Filters and Slicers',
              slug: 'connecting-filters-and-slicers',
              lessonType: LessonType.TEXT,
              content:
                'Positioning slicers to allow user-driven exploration across all dashboard cards.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Delivering Visual Insights',
              slug: 'delivering-visual-insights',
              lessonType: LessonType.TEXT,
              content:
                'Pairing analytical charts with clear insight callouts that summarize findings directly on the canvas.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Practical Lab & Deliverable',
          description: 'Building and submitting a completed Excel dashboard.',
          lessons: [
            {
              title: 'Week 7 Practical: Building an Excel Dashboard',
              slug: 'week-7-practical',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Practical Instructions:\nBuild a complete interactive Excel dashboard from a real dataset using the taught structure (Title, 4 KPIs, Trend/Comparison charts, Slicers, and Key Insights).\n\nResource: Dashboard Dataset\nSTATUS: Resource pending',
              duration: 90,
            },
            {
              title: 'Week 7 Deliverable: Mini Analytics Dashboard',
              slug: 'week-7-deliverable',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Deliverable Instructions:\nSubmit your completed Excel Mini Analytics Dashboard file.\n\nResource: Dashboard Evaluation Rubric\nSTATUS: Resource pending',
              duration: 60,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // WEEK 8: CAPSTONE & PROFESSIONAL DATA SKILLS
    // =========================================================================
    {
      weekNumber: 8,
      title: 'Capstone & Professional Data Skills',
      description:
        'Executing the 8-step Capstone project, presenting analytical findings, building a beginner portfolio, LinkedIn positioning, and career pathways.',
      modules: [
        {
          title: 'Capstone Workflow',
          description:
            'The 8-step workflow: Understand → Ask → Prepare → Analyze → Visualize → Interpret → Recommend → Present.',
          lessons: [
            {
              title: 'The 8-Step Analytics Workflow',
              slug: 'capstone-8-step-workflow',
              lessonType: LessonType.TEXT,
              content:
                'Overview of the full 8-step progression:\n1. Understand: What problem are we solving?\n2. Ask: What questions should the data answer?\n3. Prepare: Clean and validate the dataset.\n4. Analyze: Calculate relevant metrics and statistics.\n5. Visualize: Create appropriate charts and dashboard.\n6. Interpret: Identify meaningful findings.\n7. Recommend: Translate findings into actionable recommendations.\n8. Present: Communicate the results clearly.\n\n[Instructional content pending]',
              duration: 35,
            },
            {
              title: 'Scoping Your Capstone Problem',
              slug: 'scoping-capstone-problem',
              lessonType: LessonType.TEXT,
              content:
                'Defining problem scope, target stakeholder, success criteria, and dataset boundaries.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Execution Guidelines',
              slug: 'capstone-execution-guidelines',
              lessonType: LessonType.TEXT,
              content:
                'Standards for documentation, data cleaning logs, formula transparency, and quality control.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
        {
          title: 'Capstone Project',
          description: 'Final comprehensive capstone deliverables and submission requirements.',
          lessons: [
            {
              title: 'Capstone Project Overview & Instructions',
              slug: 'capstone-project-overview',
              lessonType: LessonType.TEXT,
              content:
                'Overview of the Capstone Project (Weight: 45% of overall grade).\nRequired deliverables:\n1. Clean Dataset (Excel file)\n2. Analysis (Calculations and statistical summary)\n3. Dashboard (Interactive Excel dashboard)\n4. Insight Report (Maximum 2 pages)\n5. Presentation (5–10 minute presentation)\n\nResource: Capstone Dataset\nSTATUS: Resource pending',
              duration: 30,
            },
            {
              title: 'Capstone Deliverables Submission',
              slug: 'capstone-project-submission',
              lessonType: LessonType.ASSIGNMENT,
              content:
                'Submission portal for all 5 Capstone artifacts:\n1. Clean Dataset (.xlsx)\n2. Analytical Calculations (.xlsx)\n3. Interactive Dashboard (.xlsx)\n4. 2-Page Insight Report (.pdf / .docx)\n5. Slide Deck / Presentation Recording (.pdf / .pptx / link)\n\n[Instructional content pending]',
              duration: 120,
            },
          ],
        },
        {
          title: 'Data Presentation',
          description: 'Delivering impactful technical and non-technical presentations.',
          lessons: [
            {
              title: 'Structuring a Presentation',
              slug: 'structuring-a-presentation',
              lessonType: LessonType.TEXT,
              content:
                'Setting up the context, stating the problem, showing the evidence, and closing with recommendations.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Explaining Charts',
              slug: 'explaining-charts',
              lessonType: LessonType.TEXT,
              content:
                'Guiding audience attention: stating what the axes show before interpreting the trend.\n\n[Instructional content pending]',
              duration: 25,
            },
            {
              title: 'Speaking to Non-Technical Audiences',
              slug: 'speaking-to-non-technical-audiences',
              lessonType: LessonType.TEXT,
              content:
                'Translating statistical terms into business and clinical language without losing accuracy.\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Defending Analytical Decisions',
              slug: 'defending-analytical-decisions',
              lessonType: LessonType.TEXT,
              content:
                'Handling questions about sample size, outlier exclusions, assumptions, and alternative interpretations.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Portfolio',
          description: 'Documenting analytical projects professionally.',
          lessons: [
            {
              title: 'Documenting Analytical Projects',
              slug: 'documenting-analytical-projects',
              lessonType: LessonType.TEXT,
              content:
                'Core case study documentation structure:\n• Problem\n• Dataset\n• Methodology\n• Analysis\n• Findings\n• Recommendations\n• Tools\n\n[Instructional content pending]',
              duration: 30,
            },
            {
              title: 'Creating a Beginner Data Portfolio',
              slug: 'creating-a-beginner-data-portfolio',
              lessonType: LessonType.TEXT,
              content:
                'Hosting projects on GitHub, Notion, or personal websites to showcase practical capability to employers.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'LinkedIn',
          description: 'Professional positioning and networking for data roles.',
          lessons: [
            {
              title: 'Basic Professional Positioning',
              slug: 'basic-professional-positioning',
              lessonType: LessonType.TEXT,
              content:
                'Crafting a headline, showcasing project artifacts, writing about learning journeys, and engaging with data communities.\n\n[Instructional content pending]',
              duration: 30,
            },
          ],
        },
        {
          title: 'Career Paths',
          description: 'Navigating career tracks across analytics, business intelligence, and data science.',
          lessons: [
            {
              title: 'Overview of Major Data Careers',
              slug: 'overview-of-major-data-careers',
              lessonType: LessonType.TEXT,
              content:
                'Introducing roles, responsibilities, and skill profiles for:\n• Data Analyst\n• Business Analyst\n• Business Intelligence Analyst\n• Public Health Analyst\n• Research Analyst\n• Data Scientist\n• Data Engineer\n\n[Instructional content pending]',
              duration: 35,
            },
            {
              title: 'Next Steps in Your Learning Journey',
              slug: 'next-steps-learning-journey',
              lessonType: LessonType.TEXT,
              content:
                'Transitioning from Data Literacy into specialized tracks: Data Analytics, SQL, Python for Data Science, or Healthcare Analytics.\n\n[Instructional content pending]',
              duration: 25,
            },
          ],
        },
      ],
    },
  ],
};
