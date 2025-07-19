package main

import (
	"fmt"
	"time"
)

func GenerateSquares(quit <-chan int) <-chan int {
	squares := make(chan int)
	go func() {
		for i := 1; ; i++ {
			time.Sleep(2 * time.Second)
			select {
			case squares <- i * i:
			case <-quit:
				close(squares)
				return
			}
		}
	}()
	return squares
}

func TakeUntil[K any](f func(K) bool, quit chan int, input <-chan K) <-chan K {
	output := make(chan K)
	go func() {
		defer close(output)
		moreData := true
		ok := true
		var msg K
		for ok && moreData {
			select {
			case msg, moreData = <-input:
				if moreData {
					output <- msg
					ok = f(msg)
				}
			case <-quit:
				return
			}
		}
		if !ok {
			close(quit)
		}
	}()
	return output
}

func Print[T any](quit <-chan int, input <-chan T) <-chan T {
	msgs := make(chan T)
	go func() {
		defer close(msgs)

		var msg T
		ok := true
		for ok {
			select {
			case msg, ok = <-input:
				if ok {
					fmt.Println(msg)
					msgs <- msg
				}
			case <-quit:
				return
			}
		}
	}()
	return msgs
}

func Drain[T any](quit <-chan int, input <-chan T) {
	go func() {
		ok := true

		for ok {
			select {
			case _, ok = <-input:
			case <-quit:
				return
			}
		}
	}()
}

func main() {
	quit := make(chan int)
	Drain[int](
		quit,
		Print[int](
			quit,
			TakeUntil[int](
				func(n int) bool {
					return n <= 1_000_000
				},
				quit,
				GenerateSquares(quit),
			),
		),
	)
	<-quit
}
