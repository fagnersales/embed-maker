import { randomUUID } from 'crypto'
import { collection, deleteDoc, doc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore'

type TypeOrNull<T> = T | null

export type EmbedData = {
  content: TypeOrNull<string>

  title: TypeOrNull<string>
  description: TypeOrNull<string>
  image: TypeOrNull<string>
  thumbnail: TypeOrNull<string>
  footer: TypeOrNull<{
    text: string
    iconURL: TypeOrNull<string>
  }>
  author: TypeOrNull<{
    name: string
    iconURL: TypeOrNull<string>
    url: TypeOrNull<string>
  }>
  color: TypeOrNull<number>
}

type Embed = {
  ownerId: string
  name: string
  id: string
  data: EmbedData
}

export class EmbedsRepository {
  private coll = () => collection(getFirestore(), 'embeds')
  private d = (id: string) => doc(this.coll(), id)

  public async add(props: Omit<Embed, 'id'>): Promise<void> {
    const id = randomUUID()
    return void setDoc(this.d(id), { ...props, id })
  }

  public async getAll(ownerId: string): Promise<Embed[]> {
    const snapshot = await getDocs(query(this.coll(), where('ownerId', '==', ownerId)))
    return snapshot.docs.map(doc => ({
      ownerId: doc.data().ownerId,
      name: doc.data().name,
      id: doc.data().id,
      data: doc.data().data,
    }))
  }

  public async delete(id: string): Promise<void> {
    const snapshot = await getDocs(query(this.coll(), where('id', '==', id)))
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref)
    }
  }
}