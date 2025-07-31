import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WrestlerService {
  private apiUrl = 'http://localhost:3000/wrestlers';

  constructor(private http: HttpClient) {}

  /*getWrestlers(): Observable<Wrestler[]> {
    return this.http.get<Wrestler[]>(this.apiUrl);
  }

  // ✅ POST sin enviar el id
  addWrestler(wrestler: Partial<Wrestler>): Observable<Wrestler> {
    const { id, ...wrestlerData } = wrestler;
    return this.http.post<Wrestler>(this.apiUrl, wrestlerData);
  }

  deleteWrestler(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateWrestler(id: number, wrestler: Wrestler): Observable<Wrestler> {
    return this.http.put<Wrestler>(`${this.apiUrl}/${id}`, wrestler);
  }*/
}
