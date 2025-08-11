import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Search, FileText, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { fetchDocuments, fetchDocument, Document as DocumentType } from '@/lib/documents';

// We'll use the Document type from our lib/documents.ts
// But provide a simplified version for the component props
export interface Document {
  id: string;
  name: string;
  text: string;
  date?: string;
  type?: string;
}

interface DocumentSelectorProps {
  onDocumentSelect: (document: Document | null) => void;
  selectedDocument: Document | null;
}

export function DocumentSelector({ onDocumentSelect, selectedDocument }: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Load documents when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  // Function to load documents from API
  const loadDocuments = async () => {
    setLoading(true);
    try {
      // Fetch document metadata from API
      const documentMetadata = await fetchDocuments();
      
      // For small number of documents, we could fetch content for all
      // For larger sets, we might want to fetch content only when needed
      const documentsWithContent: Document[] = [];
      
      // For now, show a limited number to avoid too many requests
      const limitedMetadata = documentMetadata.slice(0, 10);
      
      // Load documents in parallel
      await Promise.all(
        limitedMetadata.map(async (doc) => {
          try {
            const fullDoc = await fetchDocument(doc.id);
            documentsWithContent.push({
              id: fullDoc.id,
              name: fullDoc.name,
              text: fullDoc.text,
              date: fullDoc.created_at,
              type: fullDoc.file_type
            });
          } catch (error) {
            console.error(`Failed to fetch document ${doc.id}`, error);
          }
        })
      );
      
      setDocuments(documentsWithContent);
    } catch (error) {
      console.error('Failed to load documents', error);
      
      // Fallback to mock data if API fails
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Patient History - John Doe',
          text: 'Patient John Doe (45M) has a history of hypertension and type 2 diabetes. Currently on lisinopril 10mg daily and metformin 500mg twice daily.',
          date: '2023-10-15',
          type: 'medical_record'
        },
        {
          id: '2',
          name: 'Lab Results - Blood Panel',
          text: 'CBC: WBC 6.2, RBC 4.8, Hemoglobin 14.2, Hematocrit 42%, Platelets 250. Chemistry: Glucose 110, Creatinine 0.9, BUN 15, Sodium 139, Potassium 4.1',
          date: '2023-11-01',
          type: 'lab_results'
        },
        {
          id: '3',
          name: 'Medical Research - Diabetes Management',
          text: 'Recent studies show that combination therapy with GLP-1 receptor agonists and SGLT2 inhibitors provides synergistic effects for glycemic control and weight management in patients with type 2 diabetes.',
          date: '2023-09-20',
          type: 'research'
        }
      ];
      setDocuments(mockDocuments);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) || 
    (doc.type && doc.type.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (document: Document) => {
    onDocumentSelect(document);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={selectedDocument ? "default" : "outline"} 
          className="flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          {selectedDocument ? (
            <>
              <span className="truncate max-w-[150px]">{selectedDocument.name}</span>
              <span className="text-xs bg-primary/20 px-2 py-1 rounded">Selected</span>
            </>
          ) : (
            <>Attach Document</>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a Document</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Loading documents...</div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No documents found. Try a different search term.
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <Card 
                  key={doc.id} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelect(doc)}
                >
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">{doc.name}</CardTitle>
                    {doc.date && (
                      <CardDescription className="text-xs">
                        {new Date(doc.date).toLocaleDateString()}
                        {doc.type && ` • ${doc.type.replace('_', ' ')}`}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="py-0 pb-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">{doc.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          {selectedDocument && (
            <Button variant="ghost" onClick={() => onDocumentSelect(null)}>Clear Selection</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
