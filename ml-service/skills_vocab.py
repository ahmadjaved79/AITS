"""
Curated vocabulary of 500+ technical skills for NER matching.
Used by spaCy PhraseMatcher to extract skills from resume text.
"""

SKILLS_VOCAB = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "rust", "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "perl",
    "dart", "lua", "haskell", "elixir", "clojure", "groovy", "fortran", "cobol",

    # Frontend
    "react", "react.js", "reactjs", "angular", "vue", "vue.js", "vuejs",
    "next.js", "nextjs", "nuxt.js", "svelte", "html", "css", "sass", "scss",
    "less", "tailwind", "tailwind css", "bootstrap", "material ui", "chakra ui",
    "jquery", "webpack", "vite", "babel", "redux", "zustand", "graphql",
    "apollo", "storybook", "figma", "responsive design",

    # Backend
    "node.js", "nodejs", "express", "express.js", "fastapi", "django", "flask",
    "spring", "spring boot", "laravel", "rails", "ruby on rails", "asp.net",
    ".net", "dotnet", "nestjs", "hapi", "koa", "gin", "fiber", "echo",
    "rest api", "restful", "graphql api", "grpc", "microservices", "websocket",

    # Databases
    "mongodb", "postgresql", "mysql", "sqlite", "redis", "cassandra",
    "dynamodb", "firebase", "supabase", "elasticsearch", "neo4j", "oracle",
    "sql server", "mssql", "mariadb", "couchdb", "influxdb", "mongoose",
    "prisma", "sequelize", "sqlalchemy", "hibernate", "typeorm",

    # Cloud & DevOps
    "aws", "amazon web services", "azure", "google cloud", "gcp",
    "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins",
    "github actions", "gitlab ci", "circleci", "travis ci", "helm",
    "nginx", "apache", "linux", "ubuntu", "centos", "bash", "shell scripting",
    "ci/cd", "devops", "sre", "serverless", "lambda", "ec2", "s3",
    "cloudformation", "pulumi", "vagrant",

    # ML / AI / Data Science
    "machine learning", "deep learning", "neural networks", "nlp",
    "natural language processing", "computer vision", "reinforcement learning",
    "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
    "pandas", "numpy", "matplotlib", "seaborn", "plotly",
    "huggingface", "transformers", "bert", "gpt", "llm",
    "opencv", "yolo", "stable diffusion", "langchain",
    "data science", "data analysis", "data engineering",
    "feature engineering", "model training", "model deployment",
    "mlops", "mlflow", "kubeflow", "airflow", "spark", "hadoop",
    "tableau", "power bi", "looker", "dbt",

    # Mobile
    "react native", "flutter", "android", "ios", "swift", "swiftui",
    "objective-c", "xamarin", "ionic", "cordova",

    # Testing
    "unit testing", "integration testing", "jest", "pytest", "mocha",
    "chai", "cypress", "selenium", "playwright", "junit", "testng",
    "tdd", "bdd", "postman", "insomnia",

    # Security
    "cybersecurity", "penetration testing", "ethical hacking", "owasp",
    "ssl", "tls", "oauth", "jwt", "authentication", "authorization",
    "encryption", "network security", "siem", "soc",

    # Soft Skills / Methods
    "agile", "scrum", "kanban", "jira", "confluence", "git", "github",
    "gitlab", "bitbucket", "code review", "pair programming",
    "system design", "object oriented programming", "oop",
    "design patterns", "data structures", "algorithms",
    "problem solving", "communication", "teamwork", "leadership",
]

# Normalize to lowercase for matching
SKILLS_VOCAB = list(set([s.lower() for s in SKILLS_VOCAB]))