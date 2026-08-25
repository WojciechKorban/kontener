insert into categories(name,slug,position) values ('Mieszkalne','mieszkalne',1),('Modułowe','modulowe',2),('Biurowe','biurowe',3),('Usługowe','uslugowe',4),('Gastronomiczne','gastronomiczne',5),('Rekreacyjne','rekreacyjne',6),('Całoroczne','caloroczne',7) on conflict do nothing;
with c as(select id,name from categories), ins as(insert into products(category_id,name,slug,short_description,description,price_from,area,dimensions,rooms,bedrooms,purpose,featured,status,published_at) values
((select id from c where name='Rekreacyjne'),'MODERN 20','modern-20','Kompaktowy moduł rekreacyjny z kompletnymi instalacjami.','Gotowy moduł dopasowany do odpoczynku.',89900,20,'6,0 × 3,35 m',1,0,array['rekreacja'],false,'PUBLISHED',now()),
((select id from c where name='Mieszkalne'),'LIVING 25','living-25','Całoroczny moduł dla jednej lub dwóch osób.','Gotowy moduł mieszkalny.',109000,25,'7,5 × 3,35 m',2,1,array['mieszkanie'],true,'PUBLISHED',now()),
((select id from c where name='Całoroczne'),'FAMILY 35','family-35','Nowoczesny całoroczny dom dla 2–4 osób.','Salon z kuchnią, sypialnia i łazienka.',149000,35,'10,5 × 3,35 m',3,1,array['mieszkanie'],true,'PUBLISHED',now()),
((select id from c where name='Modułowe'),'FAMILY 50','family-50','Rodzinny dom modułowy z dwiema sypialniami.','Pełnowymiarowa przestrzeń rodzinna.',219000,50,'12,0 × 4,2 m',4,2,array['mieszkanie'],true,'PUBLISHED',now()),
((select id from c where name='Biurowe'),'OFFICE 30','office-30','Gotowe biuro z zapleczem sanitarnym.','Funkcjonalna przestrzeń pracy.',119000,30,'9,0 × 3,35 m',2,0,array['biuro'],false,'PUBLISHED',now()),
((select id from c where name='Usługowe'),'BUSINESS 40','business-40','Elastyczny moduł dla handlu i usług.','Przestrzeń gotowa do rozpoczęcia biznesu.',169000,40,'12,0 × 3,35 m',3,0,array['usługi'],false,'PUBLISHED',now()) returning id,name)
insert into product_images(product_id,url,alt,position,is_main,type) select id,case when name in ('FAMILY 35','OFFICE 30') then '/images/modern-olive.png' else '/images/hero-modular.png' end,name||' — elewacja',0,true,'EXTERIOR' from ins;
insert into faq(question,answer,position) values('Ile trwa produkcja kontenera?','Standardowy proces produkcji zajmuje zwykle 8–12 tygodni.',1),('Czy kontenery są całoroczne?','Tak, modele całoroczne posiadają izolację, ogrzewanie i szczelną stolarkę.',2),('Czy organizujecie transport?','Tak, dostarczamy i montujemy moduły w całej Polsce.',3);

insert into products(
  category_id,name,slug,short_description,description,price_net,price_from,
  price_visible,area,dimensions,rooms,bedrooms,purpose,featured,status,
  published_at,meta_title,meta_description
)
values(
  (select id from categories where slug='mieszkalne'),
  'DOMEK SAUNA',
  'domek-sauna-kontener-morski',
  'Nowy, nieużywany domek z kontenera morskiego, wykończony pod klucz i wyposażony w prywatną saunę.',
  'Gotowy domek z kontenera morskiego z salonem i kuchnią, sypialnią, łazienką z prysznicem oraz sauną z piecem elektrycznym. Obiekt jest ocieplony pianą PUR i posiada kompletne wyposażenie opisane w ofercie. Realizujemy także zamówienia indywidualne: inne wielkości, układy pomieszczeń, łączenie kilku kontenerów oraz zabudowę wielokondygnacyjną.',
  140000,140000,true,null,null,0,1,
  array['mieszkanie','rekreacja','sauna'],true,'PUBLISHED',now(),
  'Domek z kontenera morskiego z sauną — pod klucz',
  'Nowy domek z kontenera morskiego z kuchnią, łazienką, sauną, klimatyzacją i rekuperacją. Cena 140 000 zł netto.'
)
on conflict(slug) do update set
  category_id=excluded.category_id,
  name=excluded.name,
  short_description=excluded.short_description,
  description=excluded.description,
  price_net=excluded.price_net,
  price_from=excluded.price_from,
  price_visible=excluded.price_visible,
  area=excluded.area,
  dimensions=excluded.dimensions,
  rooms=excluded.rooms,
  bedrooms=excluded.bedrooms,
  purpose=excluded.purpose,
  featured=excluded.featured,
  status=excluded.status,
  published_at=excluded.published_at,
  meta_title=excluded.meta_title,
  meta_description=excluded.meta_description;

insert into product_images(product_id,url,alt,position,is_main,type)
select id,'/images/hero-modular.png','Tymczasowa wizualizacja domku z kontenera morskiego z sauną',0,true,'EXTERIOR'
from products p
where p.slug='domek-sauna-kontener-morski'
  and not exists(select 1 from product_images i where i.product_id=p.id);

insert into product_parameters(product_id,name,value,unit,position)
select p.id,v.name,v.value,v.unit,v.position
from products p
cross join (values
  ('Stan','Nowy, nieużywany',null,0),
  ('Wykończenie','Pod klucz',null,1),
  ('Konstrukcja','Kontener morski',null,2),
  ('Izolacja','Piana PUR',null,3),
  ('Okna','Trzyszybowe',null,4),
  ('Ogrzewanie','Podłogowe elektryczne',null,5),
  ('Wentylacja','Rekuperator',null,6),
  ('Klimatyzacja','Klimatyzator',null,7)
) as v(name,value,unit,position)
where p.slug='domek-sauna-kontener-morski'
  and not exists(
    select 1 from product_parameters pp
    where pp.product_id=p.id and pp.name=v.name
  );

insert into product_features(product_id,category,name,position)
select p.id,v.category,v.name,v.position
from products p
cross join (values
  ('Wnętrze','Salon z kuchnią',0),
  ('Wnętrze','Sypialnia',1),
  ('Wnętrze','Wodoodporne panele winylowe w sypialni i kuchni',2),
  ('Kuchnia','Zmywarka',0),
  ('Kuchnia','Lodówka',1),
  ('Kuchnia','Filtr wody',2),
  ('Łazienka','Łazienka z prysznicem',0),
  ('Sauna','Sauna',0),
  ('Sauna','Piec elektryczny',1),
  ('Instalacje','Klimatyzator',0),
  ('Instalacje','Rekuperator',1),
  ('Instalacje','Elektryczne ogrzewanie podłogowe',2)
) as v(category,name,position)
where p.slug='domek-sauna-kontener-morski'
  and not exists(
    select 1 from product_features pf
    where pf.product_id=p.id and pf.category=v.category and pf.name=v.name
  );
