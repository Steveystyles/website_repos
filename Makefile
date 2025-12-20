dev:
	./mode dev

prod:
	./mode prod

stop:
	./mode stop

status:
	./mode status

restart-dev:
	make stop
	make dev

restart-prod:
	make stop
	make prod
