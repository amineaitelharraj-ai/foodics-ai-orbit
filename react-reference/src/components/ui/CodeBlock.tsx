import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  language: string
  code: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  return (
    <div className="relative group rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-1.5 text-xs">
        <span className="text-gray-400">{language}</span>
        <CopyButton
          text={code}
          className="!bg-gray-700 !text-gray-300 hover:!bg-gray-600"
        />
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.75rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
