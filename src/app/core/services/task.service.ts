import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators'

import { Task } from 'src/app/shared/model/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private counterId = 5;
  private apiUrl: string = 'https://jsonplaceholder.typicode.com/posts';

  constructor(
    private http: HttpClient
  ) { }

  public getTasks() {

    this.getAll().subscribe();

    return this.tasksSubject.asObservable().pipe(delay(1000));
  }

  getAll(): Observable<Task[]> {

    if (this.tasks.length > 0) {
      return this.tasksSubject.asObservable();
    }

    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap((notas: Task[]) => {
        this.tasks = notas.slice(0, 5);
        this.tasksSubject.next(this.tasks);
      })
    );
  }

  add(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      tap((item: Task) => {
        item.id = this.counterId++;;
        this.tasks.push(item);
        this.tasksSubject.next(this.tasks);
      })
    );
  }

  update(id:number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
      tap((taskUpdate: Task) => {
        const index = this.tasks.findIndex(item => item.id === id);

        if (index !== -1) {
          taskUpdate.id = id;
          this.tasks[index] = taskUpdate;
          this.tasksSubject.next(this.tasks);
        }
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.tasks = this.tasks.filter(nota => nota.id !== id);
        this.tasksSubject.next(this.tasks);
      })
    );
  }

}
