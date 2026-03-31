---
title: RAG & Embeddings
prev:
    link: '/ai/langchain'
    text: 'LangChain'
next:
    link: '/ai/prompt'
    text: 'Prompt Engineering'
---

# RAG & Embeddings

Retrieval-Augmented Generation with embeddings.

## Embeddings

```python
from langchain_openai import OpenAIEmbeddings

# Create embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small"
)

# Embed single text
vector = embeddings.embed_query("Hello world")
print(len(vector))  # 1536 dimensions

# Embed multiple texts
vectors = embeddings.embed_documents([
    "Document 1 content",
    "Document 2 content",
])
```

## Vector Stores

```python
from langchain_community.vectorstores import FAISS, Chroma
from langchain_openai import OpenAIEmbeddings

# Initialize embeddings
embeddings = OpenAIEmbeddings()

# Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

loader = TextLoader("document.txt")
documents = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = splitter.split_documents(documents)

# Create vector store
vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=embeddings
)

# FAISS (local)
vectorstore = FAISS.from_documents(
    documents=docs,
    embedding=embeddings
)
```

## Similarity Search

```python
# Similarity search
query = "What is machine learning?"
results = vectorstore.similarity_search(query, k=3)

for doc in results:
    print(doc.page_content)
    print(doc.metadata)

# Similarity with score
results = vectorstore.similarity_search_with_score(query, k=3)

for doc, score in results:
    print(f"Score: {score}, Content: {doc.page_content[:100]}")
```

## MMR Search

```python
# Max marginal relevance - diverse results
results = vectorstore.max_marginal_relevance_search(
    query,
    k=3,
    fetch_k=10,  # fetch more than k initially
    lambda_mult=0.5  # balance relevance vs diversity
)
```

## RAG Chain

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI

# LLM
llm = ChatOpenAI(model="gpt-4")

# Create QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(),
    return_source_documents=True
)

# Query
result = qa_chain({"query": "What is machine learning?"})
print(result["result"])
print(result["source_documents"])
```

## Different Chain Types

```python
# Stuff (default) - put all in context
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# Map-reduce - separate LLM call for each doc
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="map_reduce",
    retriever=vectorstore.as_retriever()
)

# Refine - iteratively refine answer
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="refine",
    retriever=vectorstore.as_retriever()
)
```

## Custom Retriever

```python
from langchain.schema import BaseRetriever
from langchain.schema import Document

class CustomRetriever(BaseRetriever):
    def get_relevant_documents(self, query: str) -> list[Document]:
        # Custom logic
        docs = []
        # ...
        return docs

    async def aget_relevant_documents(self, query: str) -> list[Document]:
        return self.get_relevant_documents(query)

# Use
retriever = CustomRetriever()
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever
)
```

## Hybrid Search

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_openai import OpenAI

# Base retriever
base_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

# Compressor
llm = OpenAI(temperature=0)
compressor = LLMChainExtractor.from_llm(llm)

# Compression retriever
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=base_retriever
)
```

## Query Transformations

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

# Generate multiple queries for better retrieval
llm = ChatOpenAI(model="gpt-4")
retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=llm
)

# Also query compression
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import EmbeddingsFilter

embeddings = OpenAIEmbeddings()
embeddings_filter = EmbeddingsFilter(
    embeddings=embeddings,
    similarity_threshold=0.8
)
```

## Vector Database (Pinecone)

```bash
pip install pinecone-client
```

```python
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore

# Initialize
pc = Pinecone(api_key="your-api-key")
index = pc.Index("my-index")

# Create vector store
vectorstore = PineconeVectorStore(
    index=index,
    embedding=embeddings,
    text_key="text"
)

# Search
results = vectorstore.similarity_search("query", k=5)
```

## Best Practices

```python
# 1. Chunk size matters
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # Adjust based on content
    chunk_overlap=200  # Maintain context
)

# 2. Use appropriate top-k
results = vectorstore.similarity_search(
    query,
    k=3  # Too few loses context, too many adds noise
)

# 3. Filter by metadata
retriever = vectorstore.as_retriever(
    filter={"source": "document.pdf"}
)

# 4. Re-rank results
# (Use cross-encoder for re-ranking)
```