import { useState, useEffect } from 'react';
import { Pencil, Trash2, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Doubt } from '../types/doubt';
import { DoubtModal } from './DoubtModal';
import { ConfirmModal } from './ConfirmModal';
import { ImagePreviewModal } from './ImagePreviewModal';

interface DoubtsViewProps {
  selectedDoubt: string | null;
  onDoubtCreated?: () => void;
  triggerAddDoubt?: boolean;
  onAddDoubtComplete?: () => void;
}

export function DoubtsView({ selectedDoubt, onDoubtCreated, triggerAddDoubt, onAddDoubtComplete }: DoubtsViewProps) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoubt, setEditingDoubt] = useState<Doubt | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [doubtToDelete, setDoubtToDelete] = useState<string | null>(null);
  const [viewingDoubt, setViewingDoubt] = useState<Doubt | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);

  useEffect(() => {
    loadDoubts();
  }, []);

  useEffect(() => {
    if (selectedDoubt) {
      const doubt = doubts.find(d => d.id === selectedDoubt);
      setViewingDoubt(doubt || null);
    } else {
      setViewingDoubt(null);
    }
  }, [selectedDoubt, doubts]);

  // Detecta quando o botão Add Dúvidas foi clicado
  useEffect(() => {
    if (triggerAddDoubt) {
      setIsModalOpen(true);
      setEditingDoubt(null);
      if (onAddDoubtComplete) onAddDoubtComplete();
    }
  }, [triggerAddDoubt, onAddDoubtComplete]);

  const loadDoubts = async () => {
    try {
      const doubtsRef = collection(db, 'doubts');
      const querySnapshot = await getDocs(doubtsRef);
      const doubtsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.().toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.().toISOString() || new Date().toISOString(),
      })) as Doubt[];
      
      setDoubts(doubtsData);
    } catch (error) {
      console.error('Erro ao carregar dúvidas:', error);
    }
  };

  const handleSaveDoubt = async (doubtData: Partial<Doubt>) => {
    try {
      console.log('Salvando dúvida:', doubtData); // Debug
      
      if (editingDoubt) {
        const doubtRef = doc(db, 'doubts', editingDoubt.id);
        await updateDoc(doubtRef, {
          name: doubtData.name,
          content: doubtData.content,
          images: doubtData.images || [],
          updated_at: Timestamp.now(),
        });
        console.log('Dúvida atualizada com sucesso');
      } else {
        const docRef = await addDoc(collection(db, 'doubts'), {
          name: doubtData.name!,
          content: doubtData.content!,
          images: doubtData.images || [],
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
        console.log('Dúvida criada com sucesso, ID:', docRef.id);
        if (onDoubtCreated) onDoubtCreated();
      }

      await loadDoubts(); // Recarrega a lista
      setEditingDoubt(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar dúvida:', error);
      alert('Erro ao salvar dúvida. Verifique o console.');
    }
  };

  const handleDeleteDoubt = (id: string) => {
    setDoubtToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!doubtToDelete) return;

    try {
      await deleteDoc(doc(db, 'doubts', doubtToDelete));
      setIsConfirmOpen(false);
      setDoubtToDelete(null);
      loadDoubts();
      setViewingDoubt(null);
    } catch (error) {
      console.error('Erro ao excluir dúvida:', error);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setDoubtToDelete(null);
  };

  const handleEdit = (doubt: Doubt) => {
    setEditingDoubt(doubt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoubt(null);
  };

  const handleImageClick = (images: string[], index: number = 0) => {
    setPreviewImages(images);
    setPreviewInitialIndex(index);
    setIsImagePreviewOpen(true);
  };

  // Se uma dúvida específica foi selecionada, mostra ela
  if (viewingDoubt) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{viewingDoubt.name}</h1>
                  <p className="text-sm text-gray-500">
                    Criado em {new Date(viewingDoubt.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(viewingDoubt)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar dúvida"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteDoubt(viewingDoubt.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir dúvida"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Orientações</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{viewingDoubt.content}</p>
              </div>

              {viewingDoubt.images && viewingDoubt.images.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Imagens de Referência</h2>
                  <div className="flex gap-3 flex-wrap">
                    {viewingDoubt.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageClick(viewingDoubt.images, index)}
                        className="relative group w-24 h-24 bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Clique nas imagens para visualizar em tamanho maior
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DoubtModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveDoubt}
          doubt={editingDoubt}
        />

        <ConfirmModal
          isOpen={isConfirmOpen}
          title="Excluir dúvida"
          message="Tem certeza que deseja excluir esta dúvida? Essa ação não poderá ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />

        <ImagePreviewModal
          isOpen={isImagePreviewOpen}
          images={previewImages}
          initialIndex={previewInitialIndex}
          onClose={() => setIsImagePreviewOpen(false)}
        />
      </div>
    );
  }

  // Lista de todas as dúvidas
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dúvidas e Orientações</h1>
          <p className="text-gray-600">Gerencie suas dúvidas e orientações cadastradas</p>
        </div>

        {doubts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-gray-400 mb-4">
              <HelpCircle size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma dúvida cadastrada
            </h3>
            <p className="text-gray-500 mb-4">
              Clique em "Add Dúvidas" na barra lateral para adicionar sua primeira dúvida
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {doubts.map((doubt) => (
              <div
                key={doubt.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{doubt.name}</h3>
                    <p className="text-gray-600 line-clamp-2 mb-3">{doubt.content}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Criado em {new Date(doubt.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {doubt.images && doubt.images.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon size={14} />
                          {doubt.images.length} {doubt.images.length === 1 ? 'imagem' : 'imagens'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(doubt)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar dúvida"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteDoubt(doubt.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir dúvida"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DoubtModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDoubt}
        doubt={editingDoubt}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Excluir dúvida"
        message="Tem certeza que deseja excluir esta dúvida? Essa ação não poderá ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        images={previewImages}
        initialIndex={previewInitialIndex}
        onClose={() => setIsImagePreviewOpen(false)}
      />
    </div>
  );
}