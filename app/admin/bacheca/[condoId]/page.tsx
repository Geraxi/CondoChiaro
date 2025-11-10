'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Pin, Image as ImageIcon, Plus, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function BachecaPage() {
  const params = useParams()
  const condoId = params?.condoId as string
  const [notices, setNotices] = useState<any[]>([])
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    media_url: '',
    pinned: false,
    comments_enabled: true,
  })

  useEffect(() => {
    if (condoId) {
      loadNotices()
    }
  }, [condoId])

  const loadNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*, author:admins(full_name, email)')
        .eq('condo_id', condoId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotices(data || [])

      // Load comments for each notice
      if (data && data.length > 0) {
        const noticeIds = data.map(n => n.id)
        const { data: commentsData } = await supabase
          .from('notice_comments')
          .select('*, author:auth.users(email)')
          .in('notice_id', noticeIds)
          .order('created_at', { ascending: true })

        if (commentsData && Array.isArray(commentsData)) {
          const commentsMap: Record<string, any[]> = {}
          commentsData.forEach((comment: any) => {
            const noticeId = comment?.notice_id
            if (noticeId) {
              if (!commentsMap[noticeId]) {
                commentsMap[noticeId] = []
              }
              commentsMap[noticeId].push(comment)
            }
          })
          setComments(commentsMap)
        }
      }
    } catch (error: any) {
      console.error('Error loading notices:', error)
      toast.error('Errore nel caricamento della bacheca')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNotice = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Sessione non valida')
        return
      }

      const { error } = await supabase
        .from('notices')
        .insert({
          condo_id: condoId,
          author_id: user.id,
          title: newNotice.title,
          content: newNotice.content,
          media_url: newNotice.media_url || null,
          pinned: newNotice.pinned,
          comments_enabled: newNotice.comments_enabled,
        })

      if (error) throw error

      toast.success('Annuncio pubblicato!')
      setShowAddModal(false)
      setNewNotice({ title: '', content: '', media_url: '', pinned: false, comments_enabled: true })
      loadNotices()
    } catch (error: any) {
      console.error('Error adding notice:', error)
      toast.error('Errore nella pubblicazione')
    }
  }

  const handleAddComment = async (noticeId: string) => {
    const commentText = newComment[noticeId]
    if (!commentText || !commentText.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Sessione non valida')
        return
      }

      const { error } = await supabase
        .from('notice_comments')
        .insert({
          notice_id: noticeId,
          author_id: user.id,
          comment_text: commentText,
        })

      if (error) throw error

      toast.success('Commento aggiunto!')
      setNewComment({ ...newComment, [noticeId]: '' })
      loadNotices()
    } catch (error: any) {
      console.error('Error adding comment:', error)
      toast.error('Errore nell\'aggiunta del commento')
    }
  }

  const pinnedNotices = notices.filter(n => n.pinned)
  const regularNotices = notices.filter(n => !n.pinned)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-gray-400">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Bacheca Digitale</h1>
          <p className="text-gray-300">Comunicazioni e annunci per il condominio</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#1FA9A0] hover:bg-[#17978E]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Annuncio
        </Button>
      </div>

      <div className="space-y-6">
        {/* Pinned Notices */}
        {pinnedNotices.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Pin className="h-5 w-5 text-[#1FA9A0]" />
              Annunci in Evidenza
            </h2>
            <div className="space-y-4">
              {pinnedNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  comments={comments[notice.id] || []}
                  expandedComments={expandedComments[notice.id] || false}
                  onToggleComments={() => setExpandedComments({
                    ...expandedComments,
                    [notice.id]: !expandedComments[notice.id]
                  })}
                  newComment={newComment[notice.id] || ''}
                  onCommentChange={(text) => setNewComment({ ...newComment, [notice.id]: text })}
                  onAddComment={() => handleAddComment(notice.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Notices */}
        <div>
          {pinnedNotices.length > 0 && (
            <h2 className="text-xl font-semibold text-white mb-4">Annunci Recenti</h2>
          )}
          <div className="space-y-4">
            {regularNotices.length === 0 && pinnedNotices.length === 0 ? (
              <Card className="bg-[#1A1F26] border-white/10">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Nessun annuncio ancora</p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#1FA9A0] hover:bg-[#17978E]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Primo Annuncio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              regularNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  comments={comments[notice.id] || []}
                  expandedComments={expandedComments[notice.id] || false}
                  onToggleComments={() => setExpandedComments({
                    ...expandedComments,
                    [notice.id]: !expandedComments[notice.id]
                  })}
                  newComment={newComment[notice.id] || ''}
                  onCommentChange={(text) => setNewComment({ ...newComment, [notice.id]: text })}
                  onAddComment={() => handleAddComment(notice.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Notice Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl bg-[#1A1F26] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Nuovo Annuncio</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pubblica un annuncio sulla bacheca del condominio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="text-white">Titolo</Label>
              <Input
                id="title"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                className="bg-[#0E141B] border-white/10 text-white mt-2"
                placeholder="Titolo dell'annuncio"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-white">Contenuto</Label>
              <Textarea
                id="content"
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                className="bg-[#0E141B] border-white/10 text-white mt-2 min-h-[150px]"
                placeholder="Scrivi il contenuto dell'annuncio..."
              />
            </div>

            <div>
              <Label htmlFor="media_url" className="text-white">URL Immagine (opzionale)</Label>
              <Input
                id="media_url"
                value={newNotice.media_url}
                onChange={(e) => setNewNotice({ ...newNotice, media_url: e.target.value })}
                className="bg-[#0E141B] border-white/10 text-white mt-2"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNotice.pinned}
                  onChange={(e) => setNewNotice({ ...newNotice, pinned: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white text-sm">Metti in evidenza</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNotice.comments_enabled}
                  onChange={(e) => setNewNotice({ ...newNotice, comments_enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white text-sm">Abilita commenti</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Annulla
              </Button>
              <Button
                onClick={handleAddNotice}
                disabled={!newNotice.title || !newNotice.content}
                className="bg-[#1FA9A0] hover:bg-[#17978E]"
              >
                Pubblica
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NoticeCard({
  notice,
  comments,
  expandedComments,
  onToggleComments,
  newComment,
  onCommentChange,
  onAddComment,
}: {
  notice: any
  comments: any[]
  expandedComments: boolean
  onToggleComments: () => void
  newComment: string
  onCommentChange: (text: string) => void
  onAddComment: () => void
}) {
  return (
    <Card className="bg-[#1A1F26] border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-white">{notice.title}</CardTitle>
              {notice.pinned && (
                <Badge className="bg-[#1FA9A0]/20 text-[#1FA9A0]">
                  <Pin className="h-3 w-3 mr-1" />
                  In Evidenza
                </Badge>
              )}
            </div>
            <CardDescription>
              {new Date(notice.created_at).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })} • {notice.author?.full_name || notice.author?.email || 'Amministratore'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-white whitespace-pre-wrap">{notice.content}</p>

          {notice.media_url && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={notice.media_url}
                alt={notice.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {notice.comments_enabled && (
            <div className="pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleComments}
                className="text-gray-400 hover:text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {comments.length} {comments.length === 1 ? 'commento' : 'commenti'}
              </Button>

              {expandedComments && (
                <div className="mt-4 space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-[#0E141B] rounded-lg border border-white/5">
                      <p className="text-sm text-white">{comment.comment_text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.created_at).toLocaleDateString('it-IT')} • {comment.author?.email || 'Utente'}
                      </p>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => onCommentChange(e.target.value)}
                      placeholder="Scrivi un commento..."
                      className="flex-1 bg-[#0E141B] border-white/10 text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          onAddComment()
                        }
                      }}
                    />
                    <Button
                      onClick={onAddComment}
                      size="sm"
                      className="bg-[#1FA9A0] hover:bg-[#17978E]"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

